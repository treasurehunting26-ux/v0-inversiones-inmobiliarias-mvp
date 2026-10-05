"""
Registro de consumo de IA y presupuesto mensual.
Referencia: AI_RUNTIME_AND_COST_GUARDRAILS.md, ERROR_HANDLING_AND_HUMAN_OVERRIDE.md (1.3)

- record_usage(): guarda tokens y coste de cada llamada. El coste sale de
  `usage.cost` que devuelve el Vercel AI Gateway (USD); si no viene, se
  estima con los precios de AI_PRICE_*_PER_MTOK. Nunca rompe la llamada.
- budget_status(): gasto del mes en curso frente a AI_MONTHLY_BUDGET_USD.
- budget_exhausted(): True si se ha agotado y el corte esta activo
  (AI_BUDGET_HARD_STOP). Entonces la IA se detiene de forma segura:
  Brigitte ofrece el contacto con el equipo y el Captador no puntua.
"""

import logging
import os
import time
from datetime import datetime
from typing import Optional

from sqlalchemy import func

import database
from models.ai_usage_log import AiUsageLog

logger = logging.getLogger("uvicorn.error")

# Precios de referencia de openai/gpt-4o-mini (USD por millon de tokens).
# Solo se usan si el Gateway no devuelve el coste.
PRICE_INPUT_PER_MTOK = float(os.getenv("AI_PRICE_INPUT_PER_MTOK", "0.15"))
PRICE_OUTPUT_PER_MTOK = float(os.getenv("AI_PRICE_OUTPUT_PER_MTOK", "0.60"))

# Fase 0 (validacion): 100-150 USD. Ajustable sin tocar codigo.
MONTHLY_BUDGET_USD = float(os.getenv("AI_MONTHLY_BUDGET_USD", "150"))
HARD_STOP = os.getenv("AI_BUDGET_HARD_STOP", "true").strip().lower() not in ("0", "false", "no")
WARNING_RATIO = 0.8

_CACHE_SECONDS = 60
_cache: dict = {"at": 0.0, "spent": 0.0, "month": None}


def _month_start(now: Optional[datetime] = None) -> datetime:
    now = now or datetime.utcnow()
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def record_usage(
    response_json: dict,
    *,
    feature: str,
    model: str,
    conversation_id: Optional[str] = None,
) -> None:
    """Guarda el consumo de una llamada. Best-effort: si falla, solo se registra en logs."""
    try:
        usage = response_json.get("usage") or {}
        prompt = int(usage.get("prompt_tokens") or 0)
        completion = int(usage.get("completion_tokens") or 0)
        cost = usage.get("cost")
        if isinstance(cost, (int, float)) and cost >= 0:
            cost_usd, source = float(cost), "gateway"
        else:
            cost_usd = (prompt * PRICE_INPUT_PER_MTOK + completion * PRICE_OUTPUT_PER_MTOK) / 1_000_000
            source = "estimate"

        db = database.SessionLocal()
        try:
            db.add(
                AiUsageLog(
                    feature=feature,
                    conversation_id=conversation_id,
                    model=model,
                    prompt_tokens=prompt,
                    completion_tokens=completion,
                    cost_usd=cost_usd,
                    cost_source=source,
                )
            )
            db.commit()
        finally:
            db.close()
        _cache["spent"] += cost_usd
    except Exception as exc:  # noqa: BLE001
        logger.error("[ai-usage] No se pudo registrar el consumo: %s: %s", exc.__class__.__name__, exc)


def month_to_date_cost(force: bool = False) -> float:
    """Gasto del mes en curso (cacheado 60 s para no consultar la BD en cada mensaje)."""
    month = _month_start()
    if not force and _cache["month"] == month and time.monotonic() - _cache["at"] < _CACHE_SECONDS:
        return _cache["spent"]
    db = database.SessionLocal()
    try:
        spent = (
            db.query(func.coalesce(func.sum(AiUsageLog.cost_usd), 0.0))
            .filter(AiUsageLog.created_at >= month)
            .scalar()
        ) or 0.0
    finally:
        db.close()
    _cache.update({"at": time.monotonic(), "spent": float(spent), "month": month})
    return float(spent)


def budget_status() -> dict:
    spent = month_to_date_cost(force=True)
    ratio = spent / MONTHLY_BUDGET_USD if MONTHLY_BUDGET_USD > 0 else 0.0
    state = "ok"
    if ratio >= 1:
        state = "exhausted"
    elif ratio >= WARNING_RATIO:
        state = "warning"
    return {
        "month_start": _month_start().date().isoformat(),
        "spent_usd": round(spent, 4),
        "budget_usd": MONTHLY_BUDGET_USD,
        "ratio": round(ratio, 4),
        "state": state,
        "hard_stop": HARD_STOP,
    }


def budget_exhausted() -> bool:
    if not HARD_STOP or MONTHLY_BUDGET_USD <= 0:
        return False
    try:
        exhausted = month_to_date_cost() >= MONTHLY_BUDGET_USD
    except Exception as exc:  # noqa: BLE001
        # Si no se puede consultar, no se bloquea el servicio por un fallo de metricas.
        logger.error("[ai-usage] No se pudo comprobar el presupuesto: %s", exc)
        return False
    if exhausted:
        logger.warning("[ai-usage] Presupuesto mensual de IA agotado (%.2f USD).", MONTHLY_BUDGET_USD)
    return exhausted
