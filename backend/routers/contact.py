"""
Router: Contact (Punto de contacto humano)
Referencia: WEB_STRUCTURE_AND_FLOWS.md (seccion 6)

Canal secundario de contacto directo para inversores avanzados.
NO es el CTA principal (el asistente lo es).

Flujo: crea un Investor (source='contact_form') + un LeadEscalation
en una sola transaccion. El escalado nace con status 'open'.

PROHIBICIONES (DATA_MODEL_AND_PERMISSIONS.md):
- No cierra escalados
- No asigna humanos
- No marca cualificacion (queda 'unqualified', lo decide el humano)
"""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from models.investor import Investor, QualificationStatus
from models.lead_escalation import LeadEscalation, EscalationStatus
from schemas.contact import ContactCreate, ContactCreated

router = APIRouter(
    prefix="/contact",
    tags=["contact"],
)


@router.post(
    "",
    response_model=ContactCreated,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar contacto humano directo",
    description="""
    Canal secundario de contacto (seccion 6 de WEB_STRUCTURE_AND_FLOWS.md).

    Crea un Investor con source='contact_form' y un LeadEscalation
    con status='open'. No notifica automaticamente ni asigna humano.
    """,
)
def create_contact(
    data: ContactCreate,
    db: Session = Depends(get_db),
) -> ContactCreated:
    """
    Registra una solicitud de contacto directo.

    - Crea Investor (qualification_status = 'unqualified')
    - Crea LeadEscalation (status = 'open')
    - Transaccion unica: si algo falla, rollback completo
    """
    now = datetime.utcnow()

    investor = Investor(
        id=str(uuid.uuid4()),
        name=data.name,
        email=data.email,
        qualification_status=QualificationStatus.UNQUALIFIED.value,
        source="contact_form",
        created_at=now,
    )

    escalation = LeadEscalation(
        id=str(uuid.uuid4()),
        investor_id=investor.id,
        reason=f"Contacto directo desde formulario web. Mensaje: {data.context}",
        created_at=now,
        status=EscalationStatus.OPEN.value,
        handled_by=None,
    )

    db.add(investor)
    db.add(escalation)
    db.commit()
    db.refresh(escalation)

    return ContactCreated(id=escalation.id, status="received")
