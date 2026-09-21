"""
Prueba de integración manual (sin pytest) de la corrección de
arquitectura FASE 2: mercado del inversor vs. mercado del activo.

Verifica, llamando directamente a approve_signal() (como lo haría el
router), que:

1. Los 5 casos de éxito del documento son válidos simultáneamente:
     Dubai -> Marbella
     Caracas -> Madrid
     India -> Costa del Sol
     Europe -> Dubai
     Dubai -> Dubai (coincidencia también es válida)
2. investor_market y preferred_property_market nunca se sobrescriben
   entre sí al aprobar una señal: el Investor resultante conserva
   exactamente los valores independientes de la señal original.
3. El flujo existente (pending_review -> approve -> Investor +
   ProspectingFollowUp) sigue funcionando sin regresiones.

Uso: cd backend && python scripts/test_market_independence.py
"""

import os
import sys
import uuid
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

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
from models.investor import Investor
from models.prospecting_signal import ProspectingSignal, SignalStatus

Base.metadata.create_all(bind=test_engine)

from routers.prospecting import approve_signal

db = TestSessionLocal()

failures = []


def check(label, condition):
    status = "OK " if condition else "FAIL"
    print(f"[{status}] {label}")
    if not condition:
        failures.append(label)


# Criterio de éxito de FASE2_AGENTE_CAPTADOR.md: los 5 casos deben ser
# válidos simultáneamente (investor_market != preferred_property_market
# en la mayoría de los casos, e igual en el último).
CASES = [
    ("dubai_uae", "Marbella"),
    ("caracas_venezuela", "Madrid"),
    ("india", "Costa del Sol"),
    ("europe", "Dubai"),
    ("dubai_uae", "Dubai"),
]

created_investors = []

for investor_market, property_market in CASES:
    signal = ProspectingSignal(
        id=str(uuid.uuid4()),
        source="test-source",
        title=f"Señal {investor_market} -> {property_market}",
        snippet="texto público de prueba",
        score=75,
        confidence=80,
        justification="Prueba automatizada",
        criteria_matched="intencion_geografica",
        status=SignalStatus.PENDING_REVIEW.value,
        created_at=datetime.utcnow(),
        investor_market=investor_market,
        investor_country=None,
        investor_city=None,
        language="es",
        estimated_investment_capacity="alta",
        preferred_property_market=property_market,
        preferred_asset_type="residencial",
    )
    db.add(signal)
    db.commit()

    approve_signal(signal_id=signal.id, db=db, _=None)
    db.refresh(signal)
    investor = db.query(Investor).filter(Investor.id == signal.investor_id).first()
    created_investors.append((investor_market, property_market, investor))

# Caso 1: Dubai -> Marbella (mercados distintos, combinación válida)
inv = created_investors[0][2]
check(
    "Caso 1: Investor market = Dubai, Property market = Marbella",
    inv.investor_market == "dubai_uae" and inv.preferred_property_market == "Marbella",
)

# Caso 2: Caracas -> Madrid
inv = created_investors[1][2]
check(
    "Caso 2: Investor market = Caracas, Property market = Madrid",
    inv.investor_market == "caracas_venezuela" and inv.preferred_property_market == "Madrid",
)

# Caso 3: India -> Costa del Sol
inv = created_investors[2][2]
check(
    "Caso 3: Investor market = India, Property market = Costa del Sol",
    inv.investor_market == "india" and inv.preferred_property_market == "Costa del Sol",
)

# Caso 4: Europe -> Dubai
inv = created_investors[3][2]
check(
    "Caso 4: Investor market = Europe, Property market = Dubai",
    inv.investor_market == "europe" and inv.preferred_property_market == "Dubai",
)

# Caso 5: Dubai -> Dubai (coincidencia también es una combinación válida)
inv = created_investors[4][2]
check(
    "Caso 5: Investor market = Dubai, Property market = Dubai",
    inv.investor_market == "dubai_uae" and inv.preferred_property_market == "Dubai",
)

# Independencia estructural: cambiar investor_market en memoria NUNCA
# debe arrastrar cambios a preferred_property_market, y viceversa.
sample = created_investors[0][2]
original_property_market = sample.preferred_property_market
sample.investor_market = "otro_mercado_cualquiera"
check(
    "Independencia: modificar investor_market no altera preferred_property_market",
    sample.preferred_property_market == original_property_market,
)

# El resto de la entidad Investor via approve_signal no sufre regresión
# (qualification_status, source, y que se generó el ProspectingFollowUp).
from models.investor import QualificationStatus
from models.prospecting_followup import ProspectingFollowUp

check(
    "Cada Investor aprobado queda 'qualified' (sin regresión)",
    all(inv.qualification_status == QualificationStatus.QUALIFIED.value for _, _, inv in created_investors),
)

followup_count = db.query(ProspectingFollowUp).count()
check(
    "Se generó una ProspectingFollowUp por cada aprobación (sin regresión)",
    followup_count == len(CASES),
)

print()
if failures:
    print(f"{len(failures)} verificación(es) fallida(s):")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
else:
    print(f"Todas las verificaciones pasaron ({len(CASES)} casos + independencia estructural).")
