"""
Modelo SQLAlchemy para Property.
Referencia: DATA_MODEL_AND_PERMISSIONS.md
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON
from database import Base


class Property(Base):
    """
    Representa una oportunidad inmobiliaria real y validada.
    
    Reglas (DATA_MODEL_AND_PERMISSIONS.md):
    - Solo humanos crean o modifican propiedades
    - El asistente solo puede leer
    - El status "published" requiere aprobación humana
    """
    __tablename__ = "properties"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    location = Column(String, nullable=False)
    asset_type = Column(String, nullable=False)
    investment_range = Column(String, nullable=False)
    roi_estimated = Column(String, nullable=True)
    horizon = Column(String, nullable=False)
    risk_notes = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="draft")  # draft | published | archived
    created_by = Column(String, nullable=False)
    approved_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Contenido enriquecido (ficha publica + dossier privado para compartir)
    description_html = Column(Text, nullable=True)
    photos = Column(JSON, nullable=True, default=list)  # lista de URLs (Vercel Blob)
    video_url = Column(String, nullable=True)  # URL de video (Vercel Blob)
    dossier_slug = Column(String, nullable=True, unique=True, index=True)
