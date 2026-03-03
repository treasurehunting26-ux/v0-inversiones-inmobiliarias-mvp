"""
Modelo SQLAlchemy: LeadEscalation
Referencia: DATA_MODEL_AND_PERMISSIONS.md (entidad 1.4)

Evento crítico de negocio: handoff a humano.
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
import enum

from database import Base


class EscalationStatus(str, enum.Enum):
    """Estados del escalado."""
    OPEN = "open"
    CONTACTED = "contacted"
    CLOSED = "closed"


class LeadEscalation(Base):
    """
    Entidad LeadEscalation.
    
    Reglas (DATA_MODEL_AND_PERMISSIONS.md):
    - El asistente SOLO puede CREAR
    - NUNCA puede cerrar
    - NUNCA puede asignar humano
    """
    __tablename__ = "lead_escalations"

    id = Column(String, primary_key=True)
    investor_id = Column(
        String, 
        ForeignKey("investors.id"), 
        nullable=False
    )
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    handled_by = Column(String, nullable=True)  # Solo humano asigna
    status = Column(
        String,
        default=EscalationStatus.OPEN.value,
        nullable=False
    )
