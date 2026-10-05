"""
Prueba de integración manual (sin pytest) de la vista humana de leads:

    GET   /admin/leads                 (filtro por estado + contadores)
    PATCH /admin/leads/{id}            (cambio de estado con handled_by obligatorio)
    GET   /admin/conversations         (listado con nº de mensajes y vista previa)
    GET   /admin/conversations/{id}    (transcripción completa, solo lectura)

Verifica también que todos exigen X-Admin-Token y que los endpoints
públicos siguen respondiendo igual.

Uso: cd backend && python scripts/test_admin_leads.py
"""

import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["ADMIN_TOKEN"] = "test-token"

from sqlalchemy import StaticPool, create_engine
from sqlalchemy.orm import sessionmaker

import database
from database import Base

# SQLite en memoria, sin tocar la base real.
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
from models import Conversation, Investor, LeadEscalation, Message  # noqa: E402


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


main.app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=test_engine)

H = {"X-Admin-Token": "test-token"}


def seed() -> None:
    db = TestSessionLocal()
    now = datetime.utcnow()
    db.add(Investor(id="inv1", name="Ana", email="ana@example.com", source="contact_form",
                    qualification_status="unqualified"))
    db.add(LeadEscalation(id="l1", investor_id="inv1", reason="Quiere Marbella", status="open",
                          created_at=now))
    db.add(LeadEscalation(id="l2", investor_id="inv1", reason="Otro", status="closed",
                          created_at=now - timedelta(days=1)))
    db.add(Conversation(id="c1"))
    db.add(Conversation(id="c2"))
    db.commit()
    db.add(Message(conversation_id="c1", role="assistant", content="Hola", created_at=now))
    db.add(Message(conversation_id="c1", role="user", content="Busco villa en Marbella",
                   created_at=now + timedelta(seconds=1)))
    db.commit()
    db.close()


def main_test() -> None:
    seed()
    client = TestClient(main.app)

    # Autenticación obligatoria
    for path in ("/admin/leads", "/admin/conversations", "/admin/conversations/c1"):
        assert client.get(path).status_code == 401, path
        assert client.get(path, headers={"X-Admin-Token": "mal"}).status_code == 401, path
    assert client.patch("/admin/leads/l1", json={"status": "closed", "handled_by": "x"}).status_code == 401

    # Listado + contadores
    data = client.get("/admin/leads", headers=H).json()
    assert [lead["id"] for lead in data["leads"]] == ["l1", "l2"], data
    assert data["counts"] == {"open": 1, "contacted": 0, "closed": 1}, data
    assert data["leads"][0]["investor"]["email"] == "ana@example.com"
    open_only = client.get("/admin/leads?status=open", headers=H).json()["leads"]
    assert [lead["id"] for lead in open_only] == ["l1"]
    assert client.get("/admin/leads?status=zzz", headers=H).status_code == 422

    # Cambio de estado: handled_by obligatorio y estado válido
    assert client.patch("/admin/leads/l1", headers=H,
                        json={"status": "contacted", "handled_by": "   "}).status_code == 422
    assert client.patch("/admin/leads/l1", headers=H,
                        json={"status": "inventado", "handled_by": "Erika"}).status_code == 422
    assert client.patch("/admin/leads/no-existe", headers=H,
                        json={"status": "closed", "handled_by": "Erika"}).status_code == 404
    updated = client.patch("/admin/leads/l1", headers=H,
                           json={"status": "contacted", "handled_by": " Erika "}).json()
    assert updated["status"] == "contacted" and updated["handled_by"] == "Erika", updated
    assert client.get("/admin/leads", headers=H).json()["counts"]["contacted"] == 1

    # Conversaciones
    convs = client.get("/admin/conversations", headers=H).json()
    assert convs["total"] == 2
    c1 = next(c for c in convs["conversations"] if c["id"] == "c1")
    assert c1["message_count"] == 2 and c1["first_user_message"] == "Busco villa en Marbella", c1
    detail = client.get("/admin/conversations/c1", headers=H).json()
    assert [m["role"] for m in detail["messages"]] == ["assistant", "user"], detail
    assert client.get("/admin/conversations/no-existe", headers=H).status_code == 404

    # Los endpoints públicos no cambian
    assert client.get("/properties").status_code == 200

    print("OK: vista de leads y conversaciones verificada")


if __name__ == "__main__":
    main_test()
