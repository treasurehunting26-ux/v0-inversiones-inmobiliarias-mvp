"""
Router: vista humana de leads y conversaciones (panel /admin).
Referencia: MVP_TECHNICAL_BLUEPRINT.md (4.4 y 4.5), DATA_MODEL_AND_PERMISSIONS.md,
ERROR_HANDLING_AND_HUMAN_OVERRIDE.md.

PROPOSITO:
Cerrar el paso 9 del flujo canonico ("Humano toma control"). Hasta ahora
los escalados solo llegaban por correo; si el correo fallaba, el lead
quedaba en la base de datos sin que nadie lo viera.

Endpoints (todos protegidos con X-Admin-Token, solo operador humano):
- GET   /admin/leads                     Lista de escalados + inversor
- PATCH /admin/leads/{id}                Cambiar estado (open/contacted/closed)
- GET   /admin/conversations             Listado de conversaciones del asistente
- GET   /admin/conversations/{id}        Transcripcion completa (solo lectura)

PROHIBICIONES:
- El asistente NO tiene acceso a este router (no usa ADMIN_TOKEN).
- No se envia ninguna comunicacion externa al cambiar un estado.
- No se borran escalados ni conversaciones (trazabilidad).
- No se modifica el inversor ni la cualificacion desde aqui.
"""

import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.conversation import Conversation, Message
from models.investor import Investor
from models.lead_escalation import EscalationStatus, LeadEscalation
from routers.admin_properties import verify_admin_token
from schemas.admin_leads import (
    ConversationDetail,
    ConversationListResponse,
    ConversationMessage,
    ConversationSummary,
    LeadCounts,
    LeadInvestor,
    LeadListResponse,
    LeadRead,
    LeadStatusUpdate,
)

logger = logging.getLogger("uvicorn.error")

router = APIRouter(
    prefix="/admin",
    tags=["admin-leads"],
    dependencies=[Depends(verify_admin_token)],
)

VALID_STATUSES = {s.value for s in EscalationStatus}
PREVIEW_CHARS = 160


def _to_lead(escalation: LeadEscalation, investor: Optional[Investor]) -> LeadRead:
    return LeadRead(
        id=escalation.id,
        reason=escalation.reason,
        status=escalation.status,
        handled_by=escalation.handled_by,
        created_at=escalation.created_at,
        investor=LeadInvestor.model_validate(investor) if investor else None,
    )


@router.get("/leads", response_model=LeadListResponse)
def list_leads(
    status: Optional[str] = Query(default=None, description="open | contacted | closed"),
    db: Session = Depends(get_db),
) -> LeadListResponse:
    """Escalados a humano, mas recientes primero, con los datos del inversor."""
    if status is not None and status not in VALID_STATUSES:
        raise HTTPException(status_code=422, detail="Estado no valido")

    query = (
        db.query(LeadEscalation, Investor)
        .outerjoin(Investor, Investor.id == LeadEscalation.investor_id)
        .order_by(LeadEscalation.created_at.desc())
    )
    if status is not None:
        query = query.filter(LeadEscalation.status == status)

    counts = LeadCounts()
    for row_status, total in (
        db.query(LeadEscalation.status, func.count(LeadEscalation.id))
        .group_by(LeadEscalation.status)
        .all()
    ):
        if row_status in VALID_STATUSES:
            setattr(counts, row_status, total)

    return LeadListResponse(
        leads=[_to_lead(esc, inv) for esc, inv in query.all()],
        counts=counts,
    )


@router.patch("/leads/{lead_id}", response_model=LeadRead)
def update_lead_status(
    lead_id: str,
    data: LeadStatusUpdate,
    db: Session = Depends(get_db),
) -> LeadRead:
    """
    Cambia el estado de un escalado. Accion humana explicita.
    Registra quien lo gestiona (handled_by). No dispara ningun contacto.
    """
    escalation = db.query(LeadEscalation).filter(LeadEscalation.id == lead_id).first()
    if not escalation:
        raise HTTPException(status_code=404, detail="Lead no encontrado")

    previous = escalation.status
    escalation.status = data.status
    escalation.handled_by = data.handled_by
    db.commit()
    db.refresh(escalation)

    # Trazabilidad del override humano (ERROR_HANDLING_AND_HUMAN_OVERRIDE.md, 6)
    logger.info(
        "[leads] %s: %s -> %s por %s (%s)",
        lead_id,
        previous,
        data.status,
        data.handled_by,
        datetime.utcnow().isoformat(),
    )

    investor = db.query(Investor).filter(Investor.id == escalation.investor_id).first()
    return _to_lead(escalation, investor)


@router.get("/conversations", response_model=ConversationListResponse)
def list_conversations(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> ConversationListResponse:
    """Conversaciones del asistente, la actividad mas reciente primero."""
    total = db.query(func.count(Conversation.id)).scalar() or 0

    conversations = (
        db.query(Conversation)
        .order_by(func.coalesce(Conversation.updated_at, Conversation.created_at).desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    ids = [c.id for c in conversations]

    counts: dict[str, int] = {}
    first_user: dict[str, str] = {}
    if ids:
        counts = dict(
            db.query(Message.conversation_id, func.count(Message.id))
            .filter(Message.conversation_id.in_(ids))
            .group_by(Message.conversation_id)
            .all()
        )
        user_messages = (
            db.query(Message.conversation_id, Message.content)
            .filter(Message.conversation_id.in_(ids), Message.role == "user")
            .order_by(Message.created_at.asc())
            .all()
        )
        for conversation_id, content in user_messages:
            first_user.setdefault(conversation_id, content[:PREVIEW_CHARS])

    return ConversationListResponse(
        conversations=[
            ConversationSummary(
                id=c.id,
                investor_id=c.investor_id,
                escalated_to_human=bool(c.escalated_to_human),
                intent_score=c.intent_score,
                message_count=counts.get(c.id, 0),
                first_user_message=first_user.get(c.id),
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
            for c in conversations
        ],
        total=total,
    )


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
) -> ConversationDetail:
    """Transcripcion completa de una conversacion. Solo lectura."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversacion no encontrada")

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return ConversationDetail(
        id=conversation.id,
        investor_id=conversation.investor_id,
        escalated_to_human=bool(conversation.escalated_to_human),
        intent_score=conversation.intent_score,
        created_at=conversation.created_at,
        messages=[
            ConversationMessage(role=m.role, content=m.content, created_at=m.created_at)
            for m in messages
        ],
    )
