"""
Router: metricas de coste de IA (panel /admin -> "Costes IA").
Referencia: AI_RUNTIME_AND_COST_GUARDRAILS.md, seccion 5:
  coste por conversacion, coste por lead cualificado, ratio de escalado
  a humano y consumo por funcionalidad. "Si una metrica empeora, se
  revisa o se apaga."

Solo lectura. Protegido con X-Admin-Token.
"""

from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models.ai_usage_log import AiUsageLog
from models.conversation import Conversation
from models.investor import Investor, QualificationStatus
from models.lead_escalation import LeadEscalation
from models.prospecting_signal import ProspectingSignal, SignalStatus
from routers.admin_properties import verify_admin_token
from services.ai_usage import budget_status

router = APIRouter(
    prefix="/admin",
    tags=["admin-ai-usage"],
    dependencies=[Depends(verify_admin_token)],
)


def _ratio(numerator: float, denominator: float) -> Optional[float]:
    return round(numerator / denominator, 6) if denominator else None


@router.get("/ai-usage")
def ai_usage(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
) -> dict:
    now = datetime.utcnow()
    since = (now - timedelta(days=days - 1)).replace(hour=0, minute=0, second=0, microsecond=0)

    rows = (
        db.query(
            AiUsageLog.created_at,
            AiUsageLog.feature,
            AiUsageLog.cost_usd,
            AiUsageLog.prompt_tokens,
            AiUsageLog.completion_tokens,
            AiUsageLog.cost_source,
        )
        .filter(AiUsageLog.created_at >= since)
        .all()
    )

    by_feature: dict[str, dict] = defaultdict(lambda: {"calls": 0, "cost_usd": 0.0, "tokens": 0})
    daily: dict[str, dict] = {
        (since + timedelta(days=i)).date().isoformat(): {"assistant": 0.0, "prospecting": 0.0}
        for i in range(days)
    }
    estimated = 0
    for created_at, feature, cost, prompt, completion, source in rows:
        f = by_feature[feature]
        f["calls"] += 1
        f["cost_usd"] += cost or 0.0
        f["tokens"] += (prompt or 0) + (completion or 0)
        day = created_at.date().isoformat()
        if day in daily and feature in daily[day]:
            daily[day][feature] += cost or 0.0
        if source == "estimate":
            estimated += 1

    assistant_cost = by_feature["assistant"]["cost_usd"]
    prospecting_cost = by_feature["prospecting"]["cost_usd"]

    conversations = db.query(Conversation).filter(Conversation.created_at >= since).count()
    assistant_leads = (
        db.query(LeadEscalation)
        .filter(
            LeadEscalation.created_at >= since,
            LeadEscalation.reason.like("Escalado desde el asistente%"),
        )
        .count()
    )
    all_leads = db.query(LeadEscalation).filter(LeadEscalation.created_at >= since).count()
    qualified = (
        db.query(Investor)
        .filter(
            Investor.created_at >= since,
            Investor.source == "assistant",
            Investor.qualification_status.in_(
                [QualificationStatus.QUALIFIED.value, QualificationStatus.HIGH_INTENT.value]
            ),
        )
        .count()
    )
    signals = db.query(ProspectingSignal).filter(ProspectingSignal.created_at >= since).count()
    approved = (
        db.query(ProspectingSignal)
        .filter(
            ProspectingSignal.created_at >= since,
            ProspectingSignal.status == SignalStatus.APPROVED.value,
        )
        .count()
    )

    return {
        "period": {"days": days, "since": since.date().isoformat(), "until": now.date().isoformat()},
        "budget": budget_status(),
        "totals": {
            "cost_usd": round(assistant_cost + prospecting_cost, 4),
            "calls": len(rows),
            "estimated_calls": estimated,
        },
        "assistant": {
            "cost_usd": round(assistant_cost, 4),
            "calls": by_feature["assistant"]["calls"],
            "conversations": conversations,
            "qualified_investors": qualified,
            "leads": assistant_leads,
            "cost_per_conversation": _ratio(assistant_cost, conversations),
            "cost_per_qualified": _ratio(assistant_cost, qualified),
            "cost_per_lead": _ratio(assistant_cost, assistant_leads),
            "handoff_rate": _ratio(assistant_leads, conversations),
        },
        "prospecting": {
            "cost_usd": round(prospecting_cost, 4),
            "calls": by_feature["prospecting"]["calls"],
            "signals": signals,
            "approved": approved,
            "cost_per_signal": _ratio(prospecting_cost, signals),
            "cost_per_approved": _ratio(prospecting_cost, approved),
        },
        "all_leads": all_leads,
        "daily": [
            {"date": d, "assistant": round(v["assistant"], 4), "prospecting": round(v["prospecting"], 4)}
            for d, v in daily.items()
        ],
    }
