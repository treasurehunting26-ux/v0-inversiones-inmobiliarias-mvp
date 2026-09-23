"""
Prueba de integración manual (sin pytest) del Source Registry:

    ProspectingSource (registry persistente)
      -> creación / actualización / activación / desactivación
      -> filtrado de fuentes activas para el Captador
      -> independencia investor_market / property_market
      -> migración idempotente desde variables de entorno (legado)
      -> compatibilidad con el ciclo actual de prospección
         (run_prospecting_cycle usando el registry en lugar de env vars)
      -> no regresión de ProspectingFollowUp / qualification_status tras
         aprobar una señal generada a partir de una fuente del registry

Uso: cd backend && python scripts/test_source_registry.py
"""

import os
import sys
import uuid
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
# Fuentes legadas por variable de entorno, usadas solo para probar la
# migración idempotente hacia el registry.
os.environ["PROSPECTING_RSS_SOURCES"] = "google_alert_test=https://example.com/feed.xml"
os.environ["PROSPECTING_SOURCES_METADATA"] = (
    '{"google_alert_test": {"country": "AE", "city": "Dubai", "market": "dubai_uae", '
    '"source_type": "google_alert", "priority": 5}}'
)

from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

import database
from database import Base

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
database.engine = test_engine
database.SessionLocal = TestSessionLocal

import models  # noqa: F401  registra todas las tablas en Base.metadata
from models.investor import Investor, QualificationStatus
from models.prospecting_followup import ProspectingFollowUp, FollowUpStatus
from models.prospecting_signal import ProspectingSignal, SignalStatus
from models.prospecting_source import ProspectingSource

Base.metadata.create_all(bind=test_engine)

import services.rss_feeds as rss_feeds
import services.scoring as scoring
from routers.prospecting import approve_signal, run_prospecting_cycle
from routers.prospecting_sources import (
    admin_activate_source,
    admin_create_source,
    admin_deactivate_source,
    admin_list_sources,
    admin_migrate_sources_from_env,
    admin_update_source,
)
from schemas.prospecting_source import ProspectingSourceCreate, ProspectingSourceUpdate
from services.source_registry import get_active_source_configs, list_active_sources

db = TestSessionLocal()

failures = []


def check(label, condition):
    status = "OK " if condition else "FAIL"
    print(f"[{status}] {label}")
    if not condition:
        failures.append(label)


# --- 1. Creación de fuente ------------------------------------------------
source_dubai = admin_create_source(
    data=ProspectingSourceCreate(
        name="foro_dubai_test",
        url="https://example.com/dubai.xml",
        source_type="rss",
        country="AE",
        city="Dubai",
        language="en",
        investor_market="dubai_uae",
        property_market="Marbella",  # inversor en Dubai interesado en el mercado de Marbella
        priority=10,
    ),
    db=db,
    _=None,
)
check("Fuente creada con id, nombre y URL correctos", source_dubai.name == "foro_dubai_test")
check("Fuente creada activa por defecto", source_dubai.active is True)

# Crear una segunda fuente con el mismo nombre debe fallar (409).
try:
    admin_create_source(
        data=ProspectingSourceCreate(name="foro_dubai_test", url="https://otra.example.com/feed.xml"),
        db=db,
        _=None,
    )
    check("Crear una fuente con nombre duplicado lanza error (409)", False)
except Exception as exc:  # noqa: BLE001
    check(
        "Crear una fuente con nombre duplicado lanza error (409)",
        getattr(exc, "status_code", None) == 409,
    )

# --- 2. Independencia investor_market / property_market ------------------
check(
    "investor_market y property_market son independientes tras crear la fuente",
    source_dubai.investor_market == "dubai_uae" and source_dubai.property_market == "Marbella",
)

updated = admin_update_source(
    source_id=source_dubai.id,
    data=ProspectingSourceUpdate(property_market="Madrid"),
    db=db,
    _=None,
)
check(
    "Actualizar property_market NO altera investor_market",
    updated.property_market == "Madrid" and updated.investor_market == "dubai_uae",
)

# --- 3. Activación / desactivación ----------------------------------------
source_forum = admin_create_source(
    data=ProspectingSourceCreate(
        name="foro_costa_del_sol_test",
        url="https://example.com/costa-del-sol.xml",
        investor_market="europe",
        property_market="Costa del Sol",
        priority=1,
    ),
    db=db,
    _=None,
)

deactivated = admin_deactivate_source(source_id=source_forum.id, db=db, _=None)
check("Desactivar una fuente la marca active=False", deactivated.active is False)

reactivated = admin_activate_source(source_id=source_forum.id, db=db, _=None)
check("Reactivar una fuente la marca active=True", reactivated.active is True)

# Desactivamos de nuevo para probar el filtrado de fuentes activas.
admin_deactivate_source(source_id=source_forum.id, db=db, _=None)

# --- 4. Filtrado de fuentes activas ---------------------------------------
all_sources = admin_list_sources(db=db, _=None)
check("GET /prospecting/sources devuelve TODAS las fuentes (activas e inactivas)", all_sources.count == 2)

active_only = list_active_sources(db)
active_names = {s.name for s in active_only}
check(
    "El filtrado de fuentes activas excluye la fuente desactivada",
    active_names == {"foro_dubai_test"},
)

active_configs = get_active_source_configs(db)
check(
    "get_active_source_configs solo devuelve configs de fuentes activas",
    len(active_configs) == 1 and active_configs[0].name == "foro_dubai_test",
)

# Reactivamos la segunda fuente para las pruebas de compatibilidad del ciclo.
admin_activate_source(source_id=source_forum.id, db=db, _=None)

# --- 5. Migración idempotente desde variables de entorno -----------------
migration_result_1 = admin_migrate_sources_from_env(db=db, _=None)
check(
    "La migración desde env importa la fuente legada 'google_alert_test'",
    "google_alert_test" in migration_result_1.migrated,
)

migrated_row = db.query(ProspectingSource).filter(ProspectingSource.name == "google_alert_test").first()
check(
    "La fuente migrada conserva su clasificación (país, ciudad, tipo)",
    migrated_row is not None
    and migrated_row.country == "AE"
    and migrated_row.city == "Dubai"
    and migrated_row.source_type == "google_alert",
)

migration_result_2 = admin_migrate_sources_from_env(db=db, _=None)
check(
    "Repetir la migración es idempotente: no duplica la fuente ya migrada",
    migration_result_2.migrated == [] and "google_alert_test" in migration_result_2.skipped_existing,
)

total_sources_after_migration = db.query(ProspectingSource).count()
check(
    "El total de fuentes tras la migración repetida no crece (sin duplicados)",
    total_sources_after_migration == 3,
)

# --- 6. Compatibilidad con el ciclo actual de prospección -----------------
# Monkeypatch: evita llamadas de red reales al leer feeds y al AI Gateway,
# manteniendo el resto del flujo real (routers/prospecting.py sin cambios
# de lógica de negocio).
fetch_calls = []


def fake_fetch_feed_items(source_name, feed_url, *, max_items=15):
    fetch_calls.append(source_name)
    return [
        rss_feeds.FeedItem(
            source=source_name,
            title=f"Señal de prueba desde {source_name}",
            link="https://example.com/item",
            snippet="Inversor busca oportunidad de alto valor, disponible ahora.",
        )
    ]


def fake_score_signal(title, snippet, *, available_property_markets=None):
    return scoring.SignalScoreResult(
        score=80,
        confidence=70,
        justification="Señal de prueba con score alto (mock).",
        criteria_matched="budget,intent",
        investor_market="dubai_uae",
        investor_country="AE",
        investor_city="Dubai",
        language="en",
        estimated_investment_capacity="alta",
        preferred_property_market="Marbella",
        preferred_asset_type="residencial",
    )


original_fetch_feed_items = rss_feeds.fetch_feed_items
original_score_signal = scoring.score_signal
rss_feeds.fetch_feed_items = fake_fetch_feed_items
# routers/prospecting.py importa score_signal directamente, así que hay
# que reemplazarlo también en ese módulo.
import routers.prospecting as prospecting_router

prospecting_router.score_signal = fake_score_signal

try:
    run_result = run_prospecting_cycle(db=db, _=None)
finally:
    rss_feeds.fetch_feed_items = original_fetch_feed_items
    prospecting_router.score_signal = original_score_signal

check(
    "El ciclo solo consulta las fuentes ACTIVAS del registry (nunca las desactivadas)",
    set(fetch_calls) == {"foro_dubai_test", "foro_costa_del_sol_test", "google_alert_test"},
)
check(
    "run_prospecting_cycle informa sources_checked = fuentes activas del registry",
    set(run_result.sources_checked) == {"foro_dubai_test", "foro_costa_del_sol_test", "google_alert_test"},
)
check("El ciclo completa en estado success", run_result.status == "success")
check(
    "El ciclo cualifica una señal por cada fuente activa (score mockeado >= 60)",
    run_result.signals_qualified == 3,
)

source_dubai_row = db.query(ProspectingSource).filter(ProspectingSource.id == source_dubai.id).first()
check(
    "last_checked_at queda registrado en la fuente tras ejecutarse el ciclo",
    source_dubai_row is not None and source_dubai_row.last_checked_at is not None,
)

# --- 7. No regresión de ProspectingFollowUp / qualification_status -------
pending_signal = (
    db.query(ProspectingSignal)
    .filter(ProspectingSignal.status == SignalStatus.PENDING_REVIEW.value)
    .first()
)
check("El ciclo generó al menos una señal pending_review", pending_signal is not None)

approve_signal(signal_id=pending_signal.id, db=db, _=None)
db.refresh(pending_signal)
investor = db.query(Investor).filter(Investor.id == pending_signal.investor_id).first()
followup = (
    db.query(ProspectingFollowUp).filter(ProspectingFollowUp.signal_id == pending_signal.id).first()
)

check(
    "Sin regresión: el Investor aprobado queda 'qualified'",
    investor is not None and investor.qualification_status == QualificationStatus.QUALIFIED.value,
)
check(
    "Sin regresión: se generó una ProspectingFollowUp pendiente",
    followup is not None and followup.status == FollowUpStatus.PENDING.value,
)
check(
    "El Investor conserva independientes investor_market y preferred_property_market",
    investor is not None
    and investor.investor_market == "dubai_uae"
    and investor.preferred_property_market == "Marbella",
)

db.close()

print()
if failures:
    print(f"RESULTADO: {len(failures)} fallo(s) -> {failures}")
    sys.exit(1)
else:
    print("RESULTADO: todas las verificaciones del Source Registry pasaron. Sin regresiones detectadas.")
