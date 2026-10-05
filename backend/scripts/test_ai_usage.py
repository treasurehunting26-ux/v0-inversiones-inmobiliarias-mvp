"""
Prueba de integración manual (sin pytest) de las métricas y el presupuesto de IA:

- record_usage: usa el coste real del Gateway (usage.cost, USD) y, si no
  viene, lo estima con los precios configurados. Nunca rompe la llamada.
- GET /admin/ai-usage: protegido; coste por conversación, por inversor
  cualificado y por lead; ratio de paso a persona; coste del Captador;
  serie diaria; estado del presupuesto.
- Presupuesto agotado: Brigitte NO llama al modelo y ofrece el contacto;
  el Captador no puntúa (scored=False -> se reintenta más adelante).
  Con el corte desactivado, todo sigue funcionando.

Uso: cd backend && python scripts/test_ai_usage.py
"""

import json
import os
import sys
import uuid
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["ADMIN_TOKEN"] = "test-token"
os.environ["AI_MONTHLY_BUDGET_USD"] = "1"
os.environ["AI_GATEWAY_API_KEY"] = "fake"
os.environ.pop("ZOHO_EMAIL_ADDRESS", None)

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

from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402
from database import get_db  # noqa: E402
from models import AiUsageLog, Conversation, Investor, LeadEscalation  # noqa: E402
from routers import ai_assistant  # noqa: E402
from services import ai_usage, scoring  # noqa: E402


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


main.app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=test_engine)
H = {"X-Admin-Token": "test-token"}

model_calls = []


async def fake_model(system_prompt, history, user_message, conversation_id=None):
    model_calls.append(user_message)
    ai_usage.record_usage(
        {"usage": {"prompt_tokens": 1000, "completion_tokens": 100, "cost": 0.0002}},
        feature="assistant", model="m", conversation_id=conversation_id,
    )
    return json.dumps({"reply": "Hola", "profile": {}, "intent": "low", "handoff": False})


ai_assistant.call_ai_model = fake_model


def logs():
    s = TestSessionLocal()
    try:
        return s.query(AiUsageLog).order_by(AiUsageLog.created_at).all()
    finally:
        s.close()


def main_test() -> None:
    client = TestClient(main.app)

    # 1. record_usage: coste real del Gateway y estimación de respaldo
    ai_usage.record_usage({"usage": {"prompt_tokens": 84, "completion_tokens": 5, "cost": 1.316e-05}},
                          feature="prospecting", model="m")
    ai_usage.record_usage({"usage": {"prompt_tokens": 1_000_000, "completion_tokens": 1_000_000}},
                          feature="prospecting", model="m")
    ai_usage.record_usage({}, feature="prospecting", model="m")  # sin usage: no rompe
    rows = logs()
    assert rows[0].cost_source == "gateway" and abs(rows[0].cost_usd - 1.316e-05) < 1e-12
    assert rows[1].cost_source == "estimate" and abs(rows[1].cost_usd - 0.75) < 1e-9, rows[1].cost_usd
    assert rows[2].cost_usd == 0

    # 2. Conversaciones reales con Brigitte (por debajo del presupuesto)
    s = TestSessionLocal()
    s.query(AiUsageLog).delete()
    s.commit()
    s.close()
    ai_usage._cache["month"] = None
    for _ in range(4):
        r = client.post("/ai/assistant", json={"message": "hola", "locale": "es"})
        assert r.status_code == 200
    assert len(model_calls) == 4
    conv_ids = {row.conversation_id for row in logs()}
    assert len(conv_ids) == 4 and None not in conv_ids, "cada coste queda ligado a su conversación"

    # Un inversor cualificado y un lead desde Brigitte
    s = TestSessionLocal()
    inv = s.query(Investor).first()
    inv.qualification_status = "qualified"
    s.add(LeadEscalation(id=str(uuid.uuid4()), investor_id=inv.id, status="open",
                         reason="Escalado desde el asistente (Brigitte).\n..."))
    s.add(LeadEscalation(id=str(uuid.uuid4()), investor_id=inv.id, status="open",
                         reason="Contacto directo desde formulario web. Mensaje: hola"))
    s.commit()
    s.close()

    # 3. Métricas
    assert client.get("/admin/ai-usage").status_code == 401
    m = client.get("/admin/ai-usage?days=7", headers=H).json()
    a = m["assistant"]
    assert a["calls"] == 4 and abs(a["cost_usd"] - 0.0008) < 1e-9, a
    assert a["conversations"] == 4 and a["leads"] == 1 and a["qualified_investors"] == 1, a
    assert abs(a["cost_per_conversation"] - 0.0002) < 1e-9 and abs(a["cost_per_lead"] - 0.0008) < 1e-9, a
    assert a["handoff_rate"] == 0.25, a
    assert m["all_leads"] == 2 and len(m["daily"]) == 7
    assert abs(m["daily"][-1]["assistant"] - 0.0008) < 1e-9, m["daily"][-1]
    assert m["budget"]["state"] == "ok" and m["budget"]["budget_usd"] == 1.0, m["budget"]

    # 4. Presupuesto agotado: no se llama al modelo
    ai_usage.record_usage({"usage": {"cost": 1.5}}, feature="prospecting", model="m")
    ai_usage._cache["month"] = None
    assert client.get("/admin/ai-usage", headers=H).json()["budget"]["state"] == "exhausted"
    calls_before = len(model_calls)
    r = client.post("/ai/assistant", json={"message": "¿sigues ahí?", "locale": "es"}).json()
    assert len(model_calls) == calls_before, "con el presupuesto agotado no se llama al modelo"
    assert r["escalate_to_human"] is True and r["response"].startswith("Perdona"), r
    res = scoring.score_signal("Inversor busca villa", "texto")
    assert res.scored is False, "el Captador no puntúa y el item se reintenta después"

    # 5. Con el corte desactivado, la IA sigue funcionando
    ai_usage.HARD_STOP = False
    client.post("/ai/assistant", json={"message": "hola otra vez", "locale": "es"})
    assert len(model_calls) == calls_before + 1
    ai_usage.HARD_STOP = True

    # 6. Lo anterior a la ventana no cuenta
    s = TestSessionLocal()
    s.add(AiUsageLog(feature="assistant", cost_usd=99, created_at=datetime.utcnow() - timedelta(days=40)))
    s.commit()
    s.close()
    assert client.get("/admin/ai-usage?days=30", headers=H).json()["assistant"]["cost_usd"] < 1

    print("OK: métricas y presupuesto de IA verificados")


if __name__ == "__main__":
    main_test()
