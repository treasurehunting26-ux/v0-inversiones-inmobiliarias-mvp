"""
Servicio: Source Registry para el Agente Captador.
Referencia: FASE2_AGENTE_CAPTADOR.md (Source Registry — expansión internacional)

Sustituye la dependencia exclusiva de las variables de entorno
PROSPECTING_RSS_SOURCES / PROSPECTING_SOURCES_METADATA por un registro
persistente en PostgreSQL (tabla prospecting_sources), gestionable desde
/admin. El Captador (routers/prospecting.py) consulta aquí las fuentes
activas antes de leer cada feed.

No introduce scraping nuevo: sigue usando exclusivamente
services.rss_feeds.fetch_feed_items sobre feeds públicos ya indexados
(RSS/Atom u otras fuentes explícitamente aprobadas).
"""

import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from models.prospecting_source import ProspectingSource
from services.rss_feeds import SourceConfig, get_source_configs


def list_all_sources(db: Session) -> list[ProspectingSource]:
    """Todas las fuentes del registry (activas e inactivas), para /admin."""
    return (
        db.query(ProspectingSource)
        .order_by(ProspectingSource.priority.desc(), ProspectingSource.name.asc())
        .all()
    )


def list_active_sources(db: Session) -> list[ProspectingSource]:
    """Fuentes activas del registry, ordenadas por prioridad descendente."""
    return (
        db.query(ProspectingSource)
        .filter(ProspectingSource.active.is_(True))
        .order_by(ProspectingSource.priority.desc(), ProspectingSource.name.asc())
        .all()
    )


def to_source_config(source: ProspectingSource) -> SourceConfig:
    """
    Adapta una fila del registry al mismo SourceConfig que ya consume
    services.rss_feeds, para no duplicar la lógica de lectura de feeds.

    El campo genérico `market` de SourceConfig es solo descriptivo
    (histórico, no se usa en el scoring); se rellena con investor_market
    por continuidad, sin que esto implique igualar mercado del inversor
    y mercado del activo.
    """
    return SourceConfig(
        name=source.name,
        url=source.url,
        country=source.country,
        city=source.city,
        region=source.region,
        language=source.language,
        market=source.investor_market or "unknown",
        source_type=source.source_type,
        priority=source.priority,
        legal_status=source.legal_status,
        active=source.active,
    )


def get_active_source_configs(db: Session) -> list[SourceConfig]:
    """Fuentes activas del registry, listas para pasar al lector de feeds."""
    return [to_source_config(s) for s in list_active_sources(db)]


def migrate_env_sources_into_registry(db: Session) -> dict:
    """
    Migra, de forma idempotente, las fuentes RSS configuradas por
    variables de entorno (legado: PROSPECTING_RSS_SOURCES /
    PROSPECTING_SOURCES_METADATA) al Source Registry persistente.

    Una fuente cuyo `name` ya exista en el registry NUNCA se duplica ni
    se sobrescribe: la migración solo AÑADE fuentes nuevas. Puede
    ejecutarse repetidas veces sin efecto tras la primera migración
    exitosa.
    """
    existing_names = {row[0] for row in db.query(ProspectingSource.name).all()}
    migrated: list[str] = []

    for config in get_source_configs():
        if config.name in existing_names:
            continue
        now = datetime.utcnow()
        row = ProspectingSource(
            id=str(uuid.uuid4()),
            name=config.name,
            url=config.url,
            source_type=config.source_type,
            country=config.country,
            city=config.city,
            region=config.region,
            language=config.language,
            # La metadata legada solo describía un "mercado" genérico
            # (config.market); se traslada a investor_market como mejor
            # aproximación disponible. property_market queda sin valor:
            # nadie debe inferirlo automáticamente a partir del legado.
            investor_market=config.market if config.market != "unknown" else None,
            property_market=None,
            priority=config.priority,
            legal_status=config.legal_status,
            active=config.active,
            created_at=now,
            updated_at=now,
        )
        db.add(row)
        migrated.append(config.name)

    db.commit()
    return {
        "migrated": migrated,
        "skipped_existing": sorted(existing_names),
    }
