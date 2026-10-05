"""
Prueba de integración manual (sin pytest) de Brigitte, con el modelo simulado
(no llama al AI Gateway ni consume créditos):

- Primera conversación: crea Investor (source=assistant) + Conversation.
- Solo se guarda el texto visible de la respuesta, nunca el JSON del modelo.
- La cualificación se aplica solo con lo que el visitante dijo, nunca se
  borra un dato ni se baja el estado (unqualified -> qualified -> high_intent).
- Salida del modelo no válida o fallo del gateway: respuesta segura en el
  idioma del visitante y formulario de contacto.
- Contexto de propiedad: solo propiedades publicadas.
- Handoff: LeadEscalation con la conversación COMPLETA (sin recorte),
  idempotente, valida email y conversación.
- Límite de mensajes en el idioma del visitante.

Uso: cd backend && python scripts/test_brigitte.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["AI_RATE_MAX_PER_WINDOW"] = "50"
os.environ["AI_RATE_MAX_PER_DAY"] = "100"
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
import rate_limit  # noqa: E402
from database import get_db  # noqa: E402
from models import Conversation, Investor, LeadEscalation, Message, Property  # noqa: E402
from routers import ai_assistant  # noqa: E402


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


main.app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=test_engine)

# --- Modelo simulado -------------------------------------------------------
calls: list[dict] = []
queue: list = []


async def fake_model(system_prompt, history, user_message, conversation_id=None):
    calls.append({"system": system_prompt, "history": history, "user": user_message})
    return queue.pop(0)


ai_assistant.call_ai_model = fake_model


def out(reply, handoff=False, intent="low", **profile):
    base = {k: None for k in ai_assistant.PROFILE_FIELDS}
    base.update(profile)
    return json.dumps({"reply": reply, "profile": base, "intent": intent, "handoff": handoff})


def db():
    return TestSessionLocal()


def seed_properties():
    s = db()
    s.add(Property(id="p1", title="Villa Los Monteros", location="Marbella", asset_type="Villa",
                   investment_range="3-4 M€", horizon="5 años", risk_notes="Mercado prime",
                   status="published", created_by="admin"))
    s.add(Property(id="p2", title="Borrador secreto", location="Madrid", asset_type="Piso",
                   investment_range="1 M€", horizon="3 años", risk_notes="-",
                   status="draft", created_by="admin"))
    s.commit()
    s.close()


def main_test() -> None:
    seed_properties()
    client = TestClient(main.app)

    # 1. Primer mensaje: crea Investor + Conversation, idioma, texto limpio
    queue.append(out("**Encantada.** ¿Buscas renta o revalorización?", investment_goal=None))
    r = client.post("/ai/assistant", json={"message": "Hola, me interesa Marbella", "locale": "es"})
    assert r.status_code == 200, r.text
    body = r.json()
    conv_id = body["conversation_id"]
    assert body["response"] == "Encantada. ¿Buscas renta o revalorización?", body
    assert body["escalate_to_human"] is False
    s = db()
    conv = s.get(Conversation, conv_id)
    inv = s.get(Investor, conv.investor_id)
    assert inv.source == "assistant" and inv.language == "es" and inv.qualification_status == "unqualified"
    msgs = s.query(Message).filter(Message.conversation_id == conv_id).order_by(Message.created_at).all()
    assert [m.role for m in msgs] == ["user", "assistant"]
    assert "{" not in msgs[1].content  # nunca se guarda el JSON
    s.close()

    # El prompt lleva solo propiedades publicadas e indica el idioma
    system = calls[-1]["system"]
    assert "Villa Los Monteros" in system and "Borrador secreto" not in system
    assert "use Spanish" in system

    # 2. Cualificación progresiva sin perder datos
    queue.append(out("Perfecto.", investment_goal="renta", budget_range="2-3 M€", intent="medium"))
    client.post("/ai/assistant", json={"message": "Renta, unos 2-3 millones", "conversation_id": conv_id, "locale": "es"})
    queue.append(out("Entendido.", preferred_property_market="Marbella", horizon="este año",
                     investment_goal=None, budget_range=None))
    client.post("/ai/assistant", json={"message": "Marbella, este año", "conversation_id": conv_id, "locale": "es"})
    s = db()
    inv = s.get(Investor, s.get(Conversation, conv_id).investor_id)
    assert inv.investment_goal == "renta" and inv.budget_range == "2-3 M€", "no debe borrar datos"
    assert inv.preferred_property_market == "Marbella" and inv.horizon == "este año"
    assert inv.qualification_status == "qualified", inv.qualification_status
    s.close()
    # El perfil conocido llega al prompt para no repetir preguntas
    assert "Budget: 2-3 M€" in calls[-1]["system"]

    # 3. Contexto de propiedad: publicada sí, borrador no
    queue.append(out("Es una villa en Marbella."))
    client.post("/ai/assistant", json={"message": "¿Qué tal esta?", "conversation_id": conv_id, "property_id": "p1"})
    assert "VISITOR CONTEXT" in calls[-1]["system"] and "Villa Los Monteros" in calls[-1]["system"]
    queue.append(out("Vale."))
    client.post("/ai/assistant", json={"message": "¿Y esta?", "conversation_id": conv_id, "property_id": "p2"})
    assert "VISITOR CONTEXT" not in calls[-1]["system"]

    # 4. Salida no JSON -> se usa el texto, sin romper
    queue.append("Claro, te cuento lo que sé.")
    r = client.post("/ai/assistant", json={"message": "Cuéntame", "conversation_id": conv_id})
    assert r.json()["response"] == "Claro, te cuento lo que sé." and r.json()["escalate_to_human"] is False

    # 5. Handoff aceptado por el visitante -> high_intent
    queue.append(out("Te paso con el equipo; abajo tienes un pequeño formulario.", handoff=True, intent="high"))
    r = client.post("/ai/assistant", json={"message": "Sí, que me llamen", "conversation_id": conv_id})
    assert r.json()["escalate_to_human"] is True
    s = db()
    conv = s.get(Conversation, conv_id)
    assert s.get(Investor, conv.investor_id).qualification_status == "high_intent"
    assert conv.intent_score == 85
    s.close()

    # 6. Fallo del gateway en inglés -> mensaje seguro en inglés + formulario
    queue.append(None)
    r = client.post("/ai/assistant", json={"message": "Hello", "locale": "en"})
    assert r.json()["escalate_to_human"] is True
    assert r.json()["response"].startswith("Sorry, I'm having a technical issue"), r.json()

    # 7. Conversación inexistente
    queue.append(out("x"))
    assert client.post("/ai/assistant", json={"message": "x", "conversation_id": "nope"}).status_code == 404
    queue.clear()

    # 8. Handoff con conversación larga: transcripción COMPLETA, sin recorte
    for i in range(6):
        queue.append(out("Respuesta larga " + "detalle " * 60))
        client.post("/ai/assistant", json={"message": f"Pregunta {i} " + "texto " * 40, "conversation_id": conv_id})

    assert client.post("/ai/assistant/handoff", json={
        "conversation_id": conv_id, "name": "Ana", "email": "no-es-email"}).status_code == 422
    assert client.post("/ai/assistant/handoff", json={
        "conversation_id": "nope", "name": "Ana", "email": "ana@example.com"}).status_code == 404

    r = client.post("/ai/assistant/handoff", json={
        "conversation_id": conv_id, "name": " Ana López ", "email": "ana@example.com",
        "phone": "+34 600 000 000", "locale": "es", "property_id": "p1"})
    assert r.status_code == 201 and r.json()["status"] == "received", r.text
    s = db()
    esc = s.get(LeadEscalation, r.json()["id"])
    conv = s.get(Conversation, conv_id)
    inv = s.get(Investor, conv.investor_id)
    assert esc.status == "open" and esc.handled_by is None
    assert esc.investor_id == inv.id and inv.name == "Ana López" and inv.email == "ana@example.com"
    assert conv.escalated_to_human is True
    assert esc.reason.startswith("Escalado desde el asistente")
    assert "Hola, me interesa Marbella" in esc.reason, "debe incluir el principio de la conversación"
    assert "Pregunta 5" in esc.reason, "y el final"
    assert len(esc.reason) > 2000, len(esc.reason)
    assert "Propiedad consultada: Villa Los Monteros" in esc.reason
    assert "+34 600 000 000" in esc.reason and "Presupuesto: 2-3 M€" in esc.reason
    s.close()

    # Idempotente: no duplica escalados
    r2 = client.post("/ai/assistant/handoff", json={
        "conversation_id": conv_id, "name": "Ana", "email": "ana@example.com"})
    assert r2.json()["status"] == "already_received"
    s = db()
    assert s.query(LeadEscalation).count() == 1
    s.close()

    # 9. Límite de mensajes en el idioma del visitante
    rate_limit._hits.clear()
    rate_limit.MAX_PER_WINDOW = 1
    queue.append(out("ok"))
    client.post("/ai/assistant", json={"message": "a", "locale": "en"}, headers={"X-Locale": "en"})
    r = client.post("/ai/assistant", json={"message": "b", "locale": "en"}, headers={"X-Locale": "en"})
    assert r.status_code == 429 and r.json()["detail"].startswith("You've sent several messages"), r.json()
    r = client.post("/ai/assistant", json={"message": "b"}, headers={"X-Locale": "es"})
    assert r.json()["detail"].startswith("Me has escrito varios mensajes"), r.json()

    print("OK: Brigitte verificada (conversación, cualificación, contexto, fallos, handoff, límites)")


if __name__ == "__main__":
    main_test()
