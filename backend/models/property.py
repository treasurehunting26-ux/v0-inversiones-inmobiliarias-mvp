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
    # Version en ingles del dossier (documento HTML completo). Se muestra
    # cuando la web esta en ingles; si falta, se muestra el dossier en espanol.
    description_html_en = Column(Text, nullable=True)

    # Dossier prediseñado fuera del panel (documento HTML completo y
    # autocontenido, subido a Vercel Blob). Cuando esta presente, se sirve
    # tal cual en /dossier/{slug} en lugar de construir la pagina con
    # description_html: sustituye por completo al dossier generado aqui.
    dossier_html_url = Column(String, nullable=True)

    # Categoria de inversion: prime | value_add | development | commercial.
    # Solo "prime" aparece en la portada; null = sin clasificar.
    category = Column(String, nullable=True, index=True)
