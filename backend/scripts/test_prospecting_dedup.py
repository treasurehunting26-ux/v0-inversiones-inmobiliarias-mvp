"""
Prueba de integración manual (sin pytest) de la deduplicación del Agente Captador:

- La misma noticia (enlace de Google Alerts, con utm, o repetida en dos feeds)
  se puntúa UNA vez.
- En la siguiente ejecución no se vuelve a puntuar nada ya visto (cero coste)
  ni se crean señales duplicadas.
- Si el modelo falla, el item NO se da por visto: se reintenta después.
- Tope de items nuevos por ejecución: el resto se aplaza, no se pierde.
- Señales anteriores a este cambio (sin huella) tampoco se duplican.
- Las huellas caducadas se purgan. Solo se guarda un hash, nunca texto ni URL.

Uso: cd backend && python scripts/test_prospecting_dedup.py
"""

import os
import sys
import uuid
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from sqlalchemy import StaticPool, create_engine
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

import models  # noqa: E402,F401
from models.prospecting_seen_item import ProspectingSeenItem  # noqa: E402
from models.prospecting_signal import ProspectingSignal  # noqa: E402
from models.prospecting_source import ProspectingSource  # noqa: E402

Base.metadata.create_all(bind=test_engine)

import routers.prospecting as prospecting  # noqa: E402
import services.scoring as scoring  # noqa: E402
from services.rss_feeds import FeedItem  # noqa: E402

FEED: list[FeedItem] = []
scored_titles: list[str] = []
FAIL_TITLES: set[str] = set()


def fake_fetch(configs, *, max_items_per_source=15):
    return list(FEED)


def fake_score(title, snippet, *, available_property_markets=None):
    scored_titles.append(title)
    if title in FAIL_TITLES:
        return scoring.SignalScoreResult()  # fallo técnico: scored=False
    score = 80 if "inversor" in title.lower() else 10
    return scoring.SignalScoreResult(score=score, confidence=60, scored=True)


prospecting.fetch_items_for_configs = fake_fetch
prospecting.score_signal = fake_score


def run():
    db = TestSessionLocal()
    try:
        return prospecting.run_prospecting_cycle(db=db, _=None)
    finally:
        db.close()


def count(model):
    db = TestSessionLocal()
    try:
        return db.query(model).count()
    finally:
        db.close()


def main_test() -> None:
    db = TestSessionLocal()
    db.add(ProspectingSource(id=str(uuid.uuid4()), name="alerts", url="https://example.com/rss", active=True))
    db.commit()
    db.close()

    # Ejecución 1: la misma noticia llega de 3 formas distintas + una irrelevante
    FEED[:] = [
        FeedItem("alerts", "Inversor de Dubái busca villa en Marbella",
                 "https://www.google.com/url?rct=j&sa=t&url=https://news.example.com/villa-marbella&ct=ga&usg=X", "..."),
        FeedItem("forum", "Inversor de Dubái busca villa en Marbella",
                 "https://news.example.com/villa-marbella?utm_source=rss", "..."),
        FeedItem("forum", "Inversor de Dubái busca villa en Marbella",
                 "https://news.example.com/villa-marbella/", "..."),
        FeedItem("alerts", "Previsión del tiempo en Málaga", "https://news.example.com/tiempo", "..."),
    ]
    r1 = run()
    assert r1.signals_found == 4 and r1.scored == 2 and r1.signals_qualified == 1, r1
    assert len(scored_titles) == 2, scored_titles
    assert count(ProspectingSignal) == 1 and count(ProspectingSeenItem) == 2

    # Ejecución 2: mismo feed -> nada se puntúa ni se duplica
    scored_titles.clear()
    r2 = run()
    assert r2.scored == 0 and r2.skipped_already_seen == 2 and scored_titles == [], r2
    assert count(ProspectingSignal) == 1

    # Fallo del modelo: no se da por visto y se reintenta en la siguiente ejecución
    FEED.append(FeedItem("alerts", "Inversor mexicano pregunta por Madrid", "https://news.example.com/madrid", "..."))
    FAIL_TITLES.add("Inversor mexicano pregunta por Madrid")
    scored_titles.clear()
    r3 = run()
    assert r3.scored == 1 and r3.signals_qualified == 0 and count(ProspectingSeenItem) == 2, r3
    FAIL_TITLES.clear()
    scored_titles.clear()
    r4 = run()
    assert scored_titles == ["Inversor mexicano pregunta por Madrid"] and r4.signals_qualified == 1, (r4, scored_titles)
    assert count(ProspectingSignal) == 2

    # Tope por ejecución: lo que no entra se aplaza (no se pierde)
    prospecting.MAX_NEW_ITEMS_PER_RUN = 2
    FEED[:] = [FeedItem("alerts", f"Noticia {i}", f"https://news.example.com/n{i}", "...") for i in range(5)]
    r5 = run()
    assert r5.scored == 2 and r5.deferred == 3, r5
    r6 = run()
    assert r6.scored == 2 and r6.deferred == 1 and r6.skipped_already_seen == 2, r6
    r7 = run()
    assert r7.scored == 1 and r7.deferred == 0, r7
    prospecting.MAX_NEW_ITEMS_PER_RUN = 30

    # Señales anteriores al registro de huellas: no se duplican
    db = TestSessionLocal()
    db.add(ProspectingSignal(id=str(uuid.uuid4()), source="legacy", source_url="https://legacy.example.com/a",
                             title="Inversor antiguo", snippet="...", score=70, status="pending_review"))
    db.commit()
    db.close()
    FEED[:] = [FeedItem("legacy", "Inversor antiguo", "https://legacy.example.com/a", "...")]
    scored_titles.clear()
    run()
    assert scored_titles == [] and count(ProspectingSignal) == 3

    # Purga de huellas caducadas + solo hashes guardados
    db = TestSessionLocal()
    old = datetime.utcnow() - timedelta(days=prospecting.SEEN_RETENTION_DAYS + 1)
    db.add(ProspectingSeenItem(fingerprint="0" * 64, first_seen_at=old, score=5))
    db.commit()
    db.close()
    run()
    db = TestSessionLocal()
    assert db.get(ProspectingSeenItem, "0" * 64) is None, "las huellas caducadas deben purgarse"
    assert all(len(fp) == 64 and "http" not in fp for (fp,) in db.query(ProspectingSeenItem.fingerprint).all())
    db.close()

    print("OK: deduplicación del Agente Captador verificada")


if __name__ == "__main__":
    main_test()
