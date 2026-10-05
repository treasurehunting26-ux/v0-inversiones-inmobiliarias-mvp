"""
Modelo SQLAlchemy: ProspectingSeenItem
Referencia: FASE2_AGENTE_CAPTADOR.md, AI_RUNTIME_AND_COST_GUARDRAILS.md

Huella de cada item de feed que el Agente Captador ya ha puntuado, para no
volver a analizarlo (ni pagarlo) en ejecuciones posteriores.

GDPR: solo se guarda un hash SHA-256 del enlace (o del titulo si no hay
enlace), nunca el texto ni la URL. Las huellas caducan (ver
PROSPECTING_SEEN_RETENTION_DAYS) y se purgan en cada ejecucion.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from database import Base


class ProspectingSeenItem(Base):
    __tablename__ = "prospecting_seen_items"

    fingerprint = Column(String(64), primary_key=True)  # sha256 hex
    first_seen_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    score = Column(Integer, nullable=True)
