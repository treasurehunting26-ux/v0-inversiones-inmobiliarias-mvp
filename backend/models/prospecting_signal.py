"""
Modelo SQLAlchemy: ProspectingSignal
Referencia: FASE2_AGENTE_CAPTADOR.md

Señal de interés detectada por el Agente Captador en fuentes públicas
(Google Alerts, RSS de foros) ANTES de cualquier aprobación humana.

Reglas (FASE2_AGENTE_CAPTADOR.md):
- El agente SOLO puede crear señales en estado "pending_review"
- El agente NUNCA crea un Investor directamente
- Solo un operador humano, vía /prospecting/signals/{id}/approve, puede
  convertir una señal en un Investor real
- Descartar una señal borra el contenido textual capturado
  (derecho de supresión GDPR)
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
import enum

from database import Base


class SignalStatus(str, enum.Enum):
    """Estados de una señal de prospección."""
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    DISCARDED = "discarded"


class ProspectingSignal(Base):
    """
    Entidad ProspectingSignal.

    Cada fila representa UNA señal detectada en una fuente pública, con
    su puntuación (0-100) y la justificación de la IA. No es un inversor:
    es un candidato a revisar por un operador humano.
    """
    __tablename__ = "prospecting_signals"

    id = Column(String, primary_key=True)
    source = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    title = Column(String, nullable=False)
    snippet = Column(Text, nullable=False)
    score = Column(Integer, nullable=False, default=0)
    justification = Column(Text, nullable=True)
    criteria_matched = Column(Text, nullable=True)
    status = Column(
        String,
        default=SignalStatus.PENDING_REVIEW.value,
        nullable=False,
    )
    investor_id = Column(String, ForeignKey("investors.id"), nullable=True)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
