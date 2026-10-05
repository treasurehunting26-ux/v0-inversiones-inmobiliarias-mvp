"""
Prueba de integración manual (sin pytest) del refuerzo de seguridad:

- Un error no controlado NO devuelve detalles internos al público
  (solo un mensaje genérico y un error_id que aparece en los logs).
- /health/db: público solo ok/error; tablas únicamente con X-Admin-Token.
- /conversations y /lead-escalations exigen X-Admin-Token.
- /contact tiene límite anti-spam por IP, con mensaje en el idioma del visitante,
  y un envío bloqueado no crea nada en la base de datos.
- Los endpoints públicos (/properties, /ai/assistant) siguen abiertos.

Uso: cd backend && python scripts/test_security.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["ADMIN_TOKEN"] = "test-token"
os.environ["CONTACT_RATE_MAX_PER_WINDOW"] = "2"
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
from models import Investor, LeadEscalation  # noqa: E402


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


main.app.dependency_overrides[get_db] = override_get_db
main.engine = test_engine
Base.metadata.create_all(bind=test_engine)

H = {"X-Admin-Token": "test-token"}


@main.app.get("/__boom")
def boom():
    raise RuntimeError("password=supersecreto host=db.internal")


def main_test() -> None:
    client = TestClient(main.app, raise_server_exceptions=False)

    # 1. Errores sin detalles internos
    r = client.get("/__boom")
    assert r.status_code == 500
    body = r.json()
    assert "supersecreto" not in r.text and "db.internal" not in r.text, r.text
    assert body["detail"] == "Error interno del servidor" and len(body["error_id"]) == 12, body

    # 2. /health/db
    assert client.get("/health/db").json() == {"db": "ok"}
    assert client.get("/health/db", headers={"X-Admin-Token": "mal"}).json() == {"db": "ok"}
    # Con token se ve el detalle (en PostgreSQL, la lista de tablas; SQLite
    # no tiene information_schema, asi que aqui llega el detalle del error).
    admin = client.get("/health/db", headers=H).json()
    assert "tables" in admin or "detail" in admin, admin

    # 3. Endpoints internos protegidos
    assert client.post("/conversations", json={}).status_code == 401
    assert client.post("/conversations/x/messages", json={"role": "assistant", "content": "hola"}).status_code == 401
    assert client.patch("/conversations/x/intent-score", json={"intent_score": 99}).status_code == 401
    assert client.post("/lead-escalations", json={"investor_id": "x", "reason": "spam"}).status_code == 401
    assert client.post("/conversations", json={}, headers=H).status_code == 201

    # 4. Límite del formulario de contacto
    payload = {"name": "Bot", "email": "bot@example.com", "context": "spam"}
    assert client.post("/contact", json=payload).status_code == 201
    assert client.post("/contact", json=payload).status_code == 201
    r = client.post("/contact", json=payload, headers={"Accept-Language": "en-GB,en;q=0.9"})
    assert r.status_code == 429 and r.json()["detail"].startswith("We've already received"), r.json()
    r = client.post("/contact", json=payload, headers={"X-Locale": "es"})
    assert r.json()["detail"].startswith("Ya hemos recibido"), r.json()
    s = TestSessionLocal()
    assert s.query(Investor).count() == 2 and s.query(LeadEscalation).count() == 2, "un bloqueo no debe escribir"
    s.close()

    # 5. Lo público sigue abierto
    assert client.get("/properties").status_code == 200
    assert client.get("/health").json() == {"status": "ok"}

    print("OK: seguridad verificada (errores, health, endpoints internos, anti-spam)")


if __name__ == "__main__":
    main_test()
