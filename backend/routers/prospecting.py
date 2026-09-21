"""
Router: Prospecting (Agente Captador de Inversores)
Referencia: FASE2_AGENTE_CAPTADOR.md

Implementa el contrato operativo de la Fase 2. El bloqueo original del
documento (30 días en producción, 20 conversaciones reales, revisión
legal GDPR completa, VPS dedicado) fue levantado por decisión explícita
del Product Owner antes de cumplir todos los prerequisitos formales.

DESVIACIONES APROBADAS RESPECTO AL DOCUMENTO ORIGINAL:
- Corre en Vercel Cron Jobs (no en un VPS dedicado independiente).
- Fuentes v1: SOLO Google Alerts (RSS) + RSS de foros especializados.
  LinkedIn y Facebook NO se implementan aquí: requieren revisión legal
  (riesgo de infracción de Términos de Servicio y GDPR) antes de
  activarse en un módulo separado.

REGLAS INVIOLABLES (igual que el documento original):
- Este router NUNCA contacta a nadie.
- Este router NUNCA crea un Investor directamente: solo crea
  ProspectingSignal en estado "pending_review".
- Solo /prospecting/signals/{id}/approve, ejecutado por un operador
  humano autenticado con ADMIN_TOKEN, puede convertir una señal en un
  Investor real.
- Descartar una señal borra el contenido textual capturado (derecho de
  supresión GDPR).
"""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from models.investor import Investor, QualificationStatus
from models.property import Property
from models.prospecting_signal import ProspectingSignal, SignalStatus
from models.prospecting_run_log import ProspectingRunLog
from models.prospecting_followup import ProspectingFollowUp, FollowUpStatus
from routers.admin_properties import verify_admin_token
from schemas.prospecting import (
    ProspectingSignalListResponse,
    ProspectingSignalRead,
    ProspectingRunResult,
    ProspectingRunLogListResponse,
    ProspectingRunLogRead,
    ProspectingFollowUpListResponse,
    ProspectingFollowUpRead,
)
from services.rss_feeds import fetch_all_configured_feeds, get_configured_sources
from services.scoring import score_signal

MIN_QUALIFYING_SCORE = 60

router = APIRouter(
    prefix="/prospecting",
    tags=["prospecting"],
)


def _get_available_property_markets(db: Session) -> list[str]:
    """
    Mercados de activos actualmente publicados en la plataforma (ej.
    "Marbella", "Madrid", "Dubai"), usados solo como contexto de
    compatibilidad para el scoring. Property.location es el mercado del
    activo real; nunca se confunde con el mercado del inversor.
    """
    rows = (
        db.query(Property.location)
        .filter(Property.status == "published")
        .distinct()
        .all()
    )
    return [r[0] for r in rows if r[0]]


@router.post(
    "/migrate-market-fields",
    summary="Migración: añade los campos de mercado del inversor/activo",
    description="""
    Migración puntual (FASE2 — corrección de arquitectura internacional):
    añade a investors y prospecting_signals las columnas necesarias para
    distinguir el mercado del inversor del mercado del activo preferido.

    Idempotente: "ADD COLUMN IF NOT EXISTS" no falla si ya existe. Pensada
    para ejecutarse una sola vez desde el admin tras desplegar este cambio.
    """,
)
def admin_migrate_market_fields(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> dict:
    statements = [
        "ALTER TABLE investors ADD COLUMN IF NOT EXISTS investor_market VARCHAR",
        "ALTER TABLE investors ADD COLUMN IF NOT EXISTS investor_country VARCHAR",
        "ALTER TABLE investors ADD COLUMN IF NOT EXISTS investor_city VARCHAR",
        "ALTER TABLE investors ADD COLUMN IF NOT EXISTS language VARCHAR",
        "ALTER TABLE investors ADD COLUMN IF NOT EXISTS estimated_investment_capacity VARCHAR",
        "ALTER TABLE investors ADD COLUMN IF NOT EXISTS preferred_property_market VARCHAR",
        "ALTER TABLE investors ADD COLUMN IF NOT EXISTS preferred_asset_type VARCHAR",
        "ALTER TABLE prospecting_signals ADD COLUMN IF NOT EXISTS confidence INTEGER",
        "ALTER TABLE prospecting_signals ADD COLUMN IF NOT EXISTS investor_market VARCHAR",
        "ALTER TABLE prospecting_signals ADD COLUMN IF NOT EXISTS investor_country VARCHAR",
        "ALTER TABLE prospecting_signals ADD COLUMN IF NOT EXISTS investor_city VARCHAR",
        "ALTER TABLE prospecting_signals ADD COLUMN IF NOT EXISTS language VARCHAR",
        "ALTER TABLE prospecting_signals ADD COLUMN IF NOT EXISTS estimated_investment_capacity VARCHAR",
        "ALTER TABLE prospecting_signals ADD COLUMN IF NOT EXISTS preferred_property_market VARCHAR",
        "ALTER TABLE prospecting_signals ADD COLUMN IF NOT EXISTS preferred_asset_type VARCHAR",
    ]
    for stmt in statements:
        db.execute(text(stmt))
    db.commit()

    return {
        "status": "ok",
        "columns_ensured": [
            "investors.investor_market",
            "investors.investor_country",
            "investors.investor_city",
            "investors.language",
            "investors.estimated_investment_capacity",
            "investors.preferred_property_market",
            "investors.preferred_asset_type",
            "prospecting_signals.confidence",
            "prospecting_signals.investor_market",
            "prospecting_signals.investor_country",
            "prospecting_signals.investor_city",
            "prospecting_signals.language",
            "prospecting_signals.estimated_investment_capacity",
            "prospecting_signals.preferred_property_market",
            "prospecting_signals.preferred_asset_type",
        ],
    }


@router.post(
    "/run",
    response_model=ProspectingRunResult,
    summary="Ejecutar un ciclo de captación (Agente Captador)",
    description="""
    Disparado por el Cron Job de Vercel (nunca directamente por un
    visitante). Lee las fuentes RSS configuradas, puntúa cada item con
    IA según los 5 criterios de FASE2_AGENTE_CAPTADOR.md, y guarda como
    señal "pending_review" solo los que alcanzan score >= 60.

    No contacta a nadie. No crea Investor. Solo genera señales para
    revisión humana.
    """,
)
def run_prospecting_cycle(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingRunResult:
    run_id = str(uuid.uuid4())
    sources = get_configured_sources()
    run_log = ProspectingRunLog(
        id=run_id,
        started_at=datetime.utcnow(),
        sources_checked=", ".join(sources.keys()) if sources else "(ninguna configurada)",
        signals_found=0,
        signals_qualified=0,
        status="success",
    )
    db.add(run_log)
    db.commit()

    try:
        items = fetch_all_configured_feeds()
        available_markets = _get_available_property_markets(db)
        qualified = 0

        for item in items:
            result = score_signal(
                item.title,
                item.snippet,
                available_property_markets=available_markets,
            )
            if result.score >= MIN_QUALIFYING_SCORE:
                signal = ProspectingSignal(
                    id=str(uuid.uuid4()),
                    source=item.source,
                    source_url=item.link or None,
                    title=item.title,
                    snippet=item.snippet,
                    score=result.score,
                    confidence=result.confidence,
                    justification=result.justification,
                    criteria_matched=result.criteria_matched,
                    status=SignalStatus.PENDING_REVIEW.value,
                    created_at=datetime.utcnow(),
                    # Mercado del INVERSOR (dónde está) — independiente del
                    # mercado del activo que le interesa (preferred_property_market).
                    investor_market=result.investor_market,
                    investor_country=result.investor_country,
                    investor_city=result.investor_city,
                    language=result.language,
                    estimated_investment_capacity=result.estimated_investment_capacity,
                    preferred_property_market=result.preferred_property_market,
                    preferred_asset_type=result.preferred_asset_type,
                )
                db.add(signal)
                qualified += 1

        run_log.finished_at = datetime.utcnow()
        run_log.signals_found = len(items)
        run_log.signals_qualified = qualified
        db.commit()

        return ProspectingRunResult(
            run_id=run_id,
            sources_checked=list(sources.keys()),
            signals_found=len(items),
            signals_qualified=qualified,
            status="success",
        )
    except Exception as exc:  # noqa: BLE001
        run_log.finished_at = datetime.utcnow()
        run_log.status = "error"
        run_log.error_detail = str(exc)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Fallo el ciclo de captación: {exc}")


@router.get(
    "/signals",
    response_model=ProspectingSignalListResponse,
    summary="Listar señales de prospección",
)
def list_signals(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingSignalListResponse:
    signals = (
        db.query(ProspectingSignal)
        .order_by(ProspectingSignal.score.desc(), ProspectingSignal.created_at.desc())
        .all()
    )
    return ProspectingSignalListResponse(
        signals=[ProspectingSignalRead.model_validate(s) for s in signals],
        count=len(signals),
    )


@router.post(
    "/signals/{signal_id}/approve",
    response_model=ProspectingSignalRead,
    summary="Aprobar una señal y crear el Investor real",
    description="""
    ÚNICO punto del sistema donde una señal detectada por el Agente
    Captador se convierte en un Investor real. Requiere acción humana
    explícita autenticada con ADMIN_TOKEN.

    Además, genera automáticamente una ProspectingFollowUp: una tarea
    interna de seguimiento humano (NO un contacto real, NO un
    LeadEscalation) para que el Investor recién cualificado no quede
    almacenado sin visibilidad para el operador. Ver
    models/prospecting_followup.py para la justificación de por qué no
    se reutiliza LeadEscalation.
    """,
)
def approve_signal(
    signal_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingSignalRead:
    signal = db.query(ProspectingSignal).filter(ProspectingSignal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Señal no encontrada")
    if signal.status != SignalStatus.PENDING_REVIEW.value:
        raise HTTPException(status_code=409, detail="Esta señal ya fue revisada")

    investor = Investor(
        id=str(uuid.uuid4()),
        qualification_status=QualificationStatus.QUALIFIED.value,
        source=f"prospecting:{signal.source}",
        created_at=datetime.utcnow(),
        # Copia el perfil extraído por la IA, manteniendo mercado del
        # inversor y mercado del activo preferido como campos
        # independientes (nunca se igualan entre sí).
        investor_market=signal.investor_market,
        investor_country=signal.investor_country,
        investor_city=signal.investor_city,
        language=signal.language,
        estimated_investment_capacity=signal.estimated_investment_capacity,
        preferred_property_market=signal.preferred_property_market,
        preferred_asset_type=signal.preferred_asset_type,
    )
    db.add(investor)

    signal.status = SignalStatus.APPROVED.value
    signal.investor_id = investor.id
    signal.reviewed_by = "admin"
    signal.reviewed_at = datetime.utcnow()

    followup = ProspectingFollowUp(
        id=str(uuid.uuid4()),
        investor_id=investor.id,
        signal_id=signal.id,
        reason=(
            f"Investor cualificado por el Agente Captador (fuente: {signal.source}, "
            f"score: {signal.score}). Pendiente de seguimiento humano."
        ),
        status=FollowUpStatus.PENDING.value,
        created_at=datetime.utcnow(),
    )
    db.add(followup)

    db.commit()
    db.refresh(signal)
    return ProspectingSignalRead.model_validate(signal)


@router.post(
    "/signals/{signal_id}/discard",
    response_model=ProspectingSignalRead,
    summary="Descartar una señal (derecho de supresión GDPR)",
    description="""
    Descarta la señal y borra el texto capturado (título y fragmento),
    dejando solo el registro mínimo de auditoría (fuente, score, fecha).
    """,
)
def discard_signal(
    signal_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingSignalRead:
    signal = db.query(ProspectingSignal).filter(ProspectingSignal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Señal no encontrada")
    if signal.status != SignalStatus.PENDING_REVIEW.value:
        raise HTTPException(status_code=409, detail="Esta señal ya fue revisada")

    signal.status = SignalStatus.DISCARDED.value
    signal.reviewed_by = "admin"
    signal.reviewed_at = datetime.utcnow()
    # Derecho de supresión: se borra el contenido textual capturado.
    signal.snippet = "(descartado — contenido eliminado)"
    signal.title = "(descartado — contenido eliminado)"

    db.commit()
    db.refresh(signal)
    return ProspectingSignalRead.model_validate(signal)


@router.get(
    "/runs",
    response_model=ProspectingRunLogListResponse,
    summary="Historial de ejecuciones del ciclo de captación (auditoría)",
)
def list_runs(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingRunLogListResponse:
    runs = (
        db.query(ProspectingRunLog)
        .order_by(ProspectingRunLog.started_at.desc())
        .limit(50)
        .all()
    )
    return ProspectingRunLogListResponse(
        runs=[ProspectingRunLogRead.model_validate(r) for r in runs]
    )


@router.get(
    "/followups",
    response_model=ProspectingFollowUpListResponse,
    summary="Listar tareas de seguimiento generadas por el Agente Captador",
    description="""
    Lista las tareas internas de seguimiento humano creadas al aprobar
    señales. NO representa contacto real con nadie: es solo visibilidad
    para el operador sobre qué Investors cualificados por el Agente
    Captador aún esperan seguimiento manual.
    """,
)
def list_followups(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingFollowUpListResponse:
    followups = (
        db.query(ProspectingFollowUp)
        .order_by(ProspectingFollowUp.created_at.desc())
        .all()
    )
    return ProspectingFollowUpListResponse(
        followups=[ProspectingFollowUpRead.model_validate(f) for f in followups],
        count=len(followups),
    )


@router.post(
    "/followups/{followup_id}/complete",
    response_model=ProspectingFollowUpRead,
    summary="Marcar una tarea de seguimiento como completada",
    description="""
    Requiere acción humana explícita autenticada con ADMIN_TOKEN. No
    ejecuta ningún side effect externo: solo registra que el operador
    ya gestionó el seguimiento de este Investor por su cuenta.
    """,
)
def complete_followup(
    followup_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingFollowUpRead:
    followup = (
        db.query(ProspectingFollowUp)
        .filter(ProspectingFollowUp.id == followup_id)
        .first()
    )
    if not followup:
        raise HTTPException(status_code=404, detail="Tarea de seguimiento no encontrada")
    if followup.status != FollowUpStatus.PENDING.value:
        raise HTTPException(status_code=409, detail="Esta tarea ya fue completada")

    followup.status = FollowUpStatus.DONE.value
    followup.completed_at = datetime.utcnow()
    followup.completed_by = "admin"

    db.commit()
    db.refresh(followup)
    return ProspectingFollowUpRead.model_validate(followup)
