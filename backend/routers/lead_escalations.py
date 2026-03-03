"""
Router: Lead Escalations
Referencia: MVP_TECHNICAL_BLUEPRINT.md, ERROR_HANDLING_AND_HUMAN_OVERRIDE.md

Endpoint de handoff a humano. Cero margen de error.

PROHIBICIONES (del alcance de tarea):
- No cerrar escalados
- No asignar humanos
- No notificar automáticamente
- No modificar inversores ni conversaciones
- No crear endpoints GET/PATCH/DELETE
- No introducir lógica condicional por intent_score
"""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.investor import Investor
from backend.models.lead_escalation import LeadEscalation, EscalationStatus
from backend.schemas.lead_escalation import (
    LeadEscalationCreate,
    LeadEscalationCreated,
)

router = APIRouter(
    prefix="/lead-escalations",
    tags=["lead-escalations"]
)


@router.post(
    "",
    response_model=LeadEscalationCreated,
    status_code=status.HTTP_201_CREATED,
    summary="Crear escalado a humano",
    description="""
    Crea un evento de escalado para handoff a operador humano.
    
    El asistente SOLO puede crear escalados.
    No puede cerrarlos, asignar humanos ni modificarlos.
    
    Referencia: DATA_MODEL_AND_PERMISSIONS.md (entidad 1.4)
    """
)
def create_lead_escalation(
    data: LeadEscalationCreate,
    db: Session = Depends(get_db)
) -> LeadEscalationCreated:
    """
    Crear escalado a humano.
    
    - Valida que investor_id exista
    - Persiste con status = "open"
    - No ejecuta side effects
    - No notifica automáticamente
    """
    # Validar que el inversor existe
    investor = db.query(Investor).filter(
        Investor.id == data.investor_id
    ).first()
    
    if not investor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inversor no encontrado"
        )
    
    # Crear escalado con status inicial = "open"
    escalation = LeadEscalation(
        id=str(uuid.uuid4()),
        investor_id=data.investor_id,
        reason=data.reason,
        created_at=datetime.utcnow(),
        status=EscalationStatus.OPEN.value,
        handled_by=None  # Solo humano asigna
    )
    
    db.add(escalation)
    db.commit()
    db.refresh(escalation)
    
    return LeadEscalationCreated(id=escalation.id)
