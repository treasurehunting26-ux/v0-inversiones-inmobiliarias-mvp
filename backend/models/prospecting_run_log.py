"""
Modelo SQLAlchemy: ProspectingRunLog
Referencia: FASE2_AGENTE_CAPTADOR.md

Registro de cada ejecución del ciclo de captación. Cumple el requisito
explícito del documento de mantener un log auditable de fuentes
consultadas (cumplimiento GDPR).
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Text

from database import Base


class ProspectingRunLog(Base):
    """Una fila por cada ejecución del ciclo de captación."""
    __tablename__ = "prospecting_run_logs"

    id = Column(String, primary_key=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    finished_at = Column(DateTime, nullable=True)
    sources_checked = Column(Text, nullable=False)
    signals_found = Column(Integer, default=0, nullable=False)
    signals_qualified = Column(Integer, default=0, nullable=False)
    status = Column(String, default="success", nullable=False)
    error_detail = Column(Text, nullable=True)
