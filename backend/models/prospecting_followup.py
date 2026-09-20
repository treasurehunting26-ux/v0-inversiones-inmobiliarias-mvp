"""
Modelo SQLAlchemy: ProspectingFollowUp
Referencia: FASE2_AGENTE_CAPTADOR.md, DATA_MODEL_AND_PERMISSIONS.md

Tarea interna de seguimiento humano, generada automáticamente cuando un
operador aprueba una ProspectingSignal y esta se convierte en Investor.

Por qué NO es un LeadEscalation:
- LeadEscalation (DATA_MODEL_AND_PERMISSIONS.md 1.4) representa un evento
  conversacional: el Asistente lo crea en tiempo real durante una charla
  con un inversor, y su "reason" es un juicio del Asistente sobre esa
  conversación. Aquí no hay conversación ni Asistente involucrado: el
  origen es una aprobación humana sobre una señal detectada en fuentes
  públicas. Reutilizar LeadEscalation mezclaría dos orígenes distintos
  y rompería su trazabilidad y sus reglas ya cerradas.
- El router de LeadEscalation prohíbe explícitamente crear endpoints
  GET/PATCH/DELETE sobre esa entidad; esta funcionalidad los necesita.

Reglas propias de esta entidad:
- SOLO el sistema la crea, automáticamente, dentro de
  /prospecting/signals/{id}/approve. Nunca el Asistente. Nunca un
  visitante.
- Representa una tarea interna de seguimiento, no un contacto real.
  Su existencia NUNCA dispara ninguna comunicación externa (ni email,
  ni mensaje directo, ni notificación automática).
- Solo un operador humano autenticado con ADMIN_TOKEN puede marcarla
  como completada, vía /prospecting/followups/{id}/complete.
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
import enum

from database import Base


class FollowUpStatus(str, enum.Enum):
    """Estados de una tarea de seguimiento interno."""
    PENDING = "pending"
    DONE = "done"


class ProspectingFollowUp(Base):
    """
    Entidad ProspectingFollowUp.

    Vincula un Investor creado por el Agente Captador con una tarea de
    seguimiento humano pendiente, sin alterar ni sustituir LeadEscalation.
    """
    __tablename__ = "prospecting_followups"

    id = Column(String, primary_key=True)
    investor_id = Column(String, ForeignKey("investors.id"), nullable=False)
    signal_id = Column(String, ForeignKey("prospecting_signals.id"), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default=FollowUpStatus.PENDING.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    completed_by = Column(String, nullable=True)  # Solo humano completa
