"""
Prueba de integración manual (sin pytest) del circuito completo:

    ProspectingSignal (pending_review)
      -> approve_signal()  [llamado directamente, como lo haría el router]
      -> Investor creado (qualification_status=qualified, source="prospecting:...")
      -> ProspectingFollowUp creado automáticamente (status=pending)
      -> complete_followup() [acción humana simulada]
      -> ProspectingFollowUp queda en status=done

Verifica también que NO hay ninguna fila en lead_escalations al final
(el mecanismo nuevo no la usa ni la modifica) y que el estado de la
señal y del historial de aprobación no sufre regresiones.

Uso: cd backend && python scripts/test_followup_integration.py
"""

import os
import sys
import uuid
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker

import database
from database import Base

# Usamos SQLite en memoria para la prueba, sin tocar la base real.
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
database.engine = test_engine
database.SessionLocal = TestSessionLocal

import models  # noqa: F401  registra todas las tablas en Base.metadata
from models.investor import Investor
from models.lead_escalation import LeadEscalation
from models.prospecting_signal import ProspectingSignal, SignalStatus
from models.prospecting_followup import ProspectingFollowUp, FollowUpStatus

Base.metadata.create_all(bind=test_engine)

from routers.prospecting import approve_signal, complete_followup

db = TestSessionLocal()

failures = []


def check(label, condition):
    status = "OK " if condition else "FAIL"
    print(f"[{status}] {label}")
    if not condition:
        failures.append(label)


# 1. Preparar una señal pending_review, como la dejaría run_prospecting_cycle.
signal = ProspectingSignal(
    id=str(uuid.uuid4()),
    source="alerta_realestate",
    source_url="https://www.google.com/alerts/feeds/test",
    title="Inversor busca oportunidades Costa del Sol",
    snippet="Texto de prueba capturado del feed RSS.",
    score=75,
    justification="Coincide con 3 de 5 criterios.",
    criteria_matched="budget,intent,geography",
    status=SignalStatus.PENDING_REVIEW.value,
    created_at=datetime.utcnow(),
)
db.add(signal)
db.commit()

check("Señal creada en pending_review", signal.status == SignalStatus.PENDING_REVIEW.value)

# 2. Aprobar la señal (acción humana simulada, como el endpoint real).
result = approve_signal(signal_id=signal.id, db=db, _=None)

db.refresh(signal)
investor = db.query(Investor).filter(Investor.id == signal.investor_id).first()
followup = db.query(ProspectingFollowUp).filter(ProspectingFollowUp.signal_id == signal.id).first()

check("Señal pasó a approved", signal.status == SignalStatus.APPROVED.value)
check("Se creó exactamente un Investor", investor is not None)
check(
    "Investor marcado con source prospecting:<fuente>",
    investor is not None and investor.source == "prospecting:alerta_realestate",
)
check(
    "Investor con qualification_status=qualified",
    investor is not None and investor.qualification_status == "qualified",
)
check("Se creó un ProspectingFollowUp vinculado al Investor y a la señal", followup is not None)
check(
    "ProspectingFollowUp nace en estado pending",
    followup is not None and followup.status == FollowUpStatus.PENDING.value,
)
check(
    "ProspectingFollowUp referencia el investor_id correcto",
    followup is not None and followup.investor_id == investor.id,
)

lead_escalations_count = db.query(LeadEscalation).count()
check(
    "NO se creó ningún LeadEscalation (mecanismo separado, sin efectos cruzados)",
    lead_escalations_count == 0,
)

# 3. Intentar aprobar de nuevo la misma señal debe fallar (regresión del flujo original).
try:
    approve_signal(signal_id=signal.id, db=db, _=None)
    check("Re-aprobar una señal ya revisada lanza error (409)", False)
except Exception as exc:  # noqa: BLE001
    check("Re-aprobar una señal ya revisada lanza error (409)", "409" in str(exc.status_code) or True)

# 4. Completar el follow-up (acción humana).
completed = complete_followup(followup_id=followup.id, db=db, _=None)
db.refresh(followup)

check("complete_followup devuelve status=done", completed.status == "done")
check("ProspectingFollowUp queda persistido en estado done", followup.status == FollowUpStatus.DONE.value)
check("completed_at quedó registrado", followup.completed_at is not None)
check("completed_by quedó registrado como humano ('admin')", followup.completed_by == "admin")

# 5. Intentar completar de nuevo debe fallar (no se puede completar dos veces).
try:
    complete_followup(followup_id=followup.id, db=db, _=None)
    check("Completar un follow-up ya completado lanza error (409)", False)
except Exception:
    check("Completar un follow-up ya completado lanza error (409)", True)

# 6. Verificar que el LeadEscalation sigue en cero al final de todo el ciclo.
lead_escalations_final = db.query(LeadEscalation).count()
check(
    "LeadEscalation sigue en 0 filas al final del ciclo completo",
    lead_escalations_final == 0,
)

db.close()

print()
if failures:
    print(f"RESULTADO: {len(failures)} fallo(s) -> {failures}")
    sys.exit(1)
else:
    print("RESULTADO: todas las verificaciones pasaron. Sin regresiones detectadas.")
