"""
Modelo SQLAlchemy: ProspectingSource
Referencia: FASE2_AGENTE_CAPTADOR.md (Source Registry — expansión internacional)

Registro persistente de fuentes de prospección (RSS, Atom, APIs oficiales
o feeds públicos ya aprobados). Sustituye la dependencia exclusiva de
variables de entorno (PROSPECTING_RSS_SOURCES / PROSPECTING_SOURCES_METADATA)
por un registro gestionable en base de datos y desde /admin, sin cambiar
el modelo de negocio, el scoring ni el flujo de aprobación humana.

MERCADO DEL INVERSOR vs. MERCADO DEL ACTIVO (mismo principio que en
Investor y ProspectingSignal — ver models/investor.py):
- investor_market: de dónde suele proceder la audiencia/tráfico de esta
  fuente (ej. un foro leído mayoritariamente desde India).
- property_market: qué mercado inmobiliario cubre el contenido de la
  fuente (ej. un foro especializado en Costa del Sol).
Ambos son campos independientes. NUNCA se asume que una fuente ubicada
en un mercado de inversores determinado solo genera señales sobre ese
mismo mercado de activos.

Ninguna fuente aquí registrada implica scraping nuevo: source_type está
limitado a feeds públicos ya indexados (rss, atom, official_api,
public_feed) o fuentes puntuales revisadas y aprobadas manualmente
(other_approved). LinkedIn y Facebook siguen fuera de alcance.
"""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String

from database import Base


class SourceType:
    """Tipos de fuente permitidos. Ninguno implica scraping de redes sociales."""

    RSS = "rss"
    ATOM = "atom"
    OFFICIAL_API = "official_api"
    PUBLIC_FEED = "public_feed"
    OTHER_APPROVED = "other_approved"

    ALL = (RSS, ATOM, OFFICIAL_API, PUBLIC_FEED, OTHER_APPROVED)


class ProspectingSource(Base):
    """Una fuente de prospección gestionable desde /admin."""

    __tablename__ = "prospecting_sources"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    url = Column(String, nullable=False)
    source_type = Column(String, default=SourceType.RSS, nullable=False)

    country = Column(String, nullable=True)
    city = Column(String, nullable=True)
    region = Column(String, nullable=True)
    language = Column(String, nullable=True)

    # --- Mercado del INVERSOR que suele aportar esta fuente ---
    investor_market = Column(String, nullable=True)
    # --- Mercado del ACTIVO que cubre la fuente. Nunca igual a investor_market por defecto ---
    property_market = Column(String, nullable=True)

    priority = Column(Integer, default=0, nullable=False)
    legal_status = Column(String, default="approved", nullable=False)
    active = Column(Boolean, default=True, nullable=False)

    last_checked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
