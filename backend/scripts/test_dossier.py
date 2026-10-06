"""
Prueba de integración manual (sin pytest) del flujo "el dossier es la ficha":

- Crear una propiedad con su dossier HTML completo y su portada en un paso.
- El listado admin NO incluye el HTML (pesa); el detalle sí. has_dossier/dossier_kb.
- Corregir los datos (PATCH) sin tocar el dossier; validaciones.
- Propuesta de datos con IA: solo lo que dice el dossier; fallo -> vacío seguro.
- Recuperar un dossier subido antes a Vercel Blob: solo ese dominio (anti-SSRF).
- Quitar dossier_html_url con "" al pasar al nuevo formato.
- Catálogo público con portada; ficha pública con el HTML.
- Brigitte recibe el texto del dossier de la propiedad que mira el visitante
  (sin scripts ni estilos), y un extracto del resto.

Uso: cd backend && python scripts/test_dossier.py
"""

import io
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["ADMIN_TOKEN"] = "test-token"
os.environ["AI_GATEWAY_API_KEY"] = "fake"

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
from routers import ai_assistant  # noqa: E402
from services import dossier as dossier_service  # noqa: E402


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


main.app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=test_engine)
H = {"X-Admin-Token": "test-token"}

DOSSIER = """<!DOCTYPE html><html lang="es"><head><title>Villa Aurora</title>
<style>.hero{background:url(https://cdn.example.com/hero.jpg)} body{font-family:serif}</style>
<script>document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'))</script></head>
<body><section class="hero"><h1>Villa Aurora</h1><p>Sierra Blanca, Marbella</p></section>
<section class="reveal"><p>Villa contemporánea de 6 dormitorios con vistas al mar.</p>
<p>Precio: 4.950.000 €</p><p>Licencia de primera ocupación en trámite.</p></section></body></html>"""


class FakeResponse(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


def main_test() -> None:
    client = TestClient(main.app)

    # 1. Texto visible del dossier
    text = dossier_service.html_to_text(DOSSIER)
    assert "Villa contemporánea de 6 dormitorios" in text and "4.950.000 €" in text
    assert "querySelectorAll" not in text and "font-family" not in text, text
    assert dossier_service.is_full_html_document(DOSSIER)
    assert not dossier_service.is_full_html_document("<p>fragmento</p>")

    # 2. Crear en un paso (horizonte y riesgos pueden ir vacíos)
    r = client.post("/admin/properties", headers=H, json={
        "title": "Villa Aurora", "location": "Sierra Blanca, Marbella", "asset_type": "Villa",
        "investment_range": "4.950.000 €", "description_html": DOSSIER,
        "photos": ["https://x.public.blob.vercel-storage.com/cover.jpg"],
    })
    assert r.status_code == 201, r.text
    created = r.json()
    pid = created["id"]
    assert created["status"] == "draft" and created["has_dossier"] is True and created["dossier_kb"] >= 0
    assert "description_html" not in created

    listing = client.get("/admin/properties", headers=H).json()["properties"][0]
    assert "description_html" not in listing and listing["has_dossier"] is True
    detail = client.get(f"/admin/properties/{pid}", headers=H).json()
    assert detail["description_html"] == DOSSIER
    assert client.get("/admin/properties/nope", headers=H).status_code == 404
    assert client.get(f"/admin/properties/{pid}").status_code == 401

    # 3. Corregir datos sin tocar el dossier
    r = client.patch(f"/admin/properties/{pid}", headers=H, json={"horizon": " Entrega inmediata ", "risk_notes": "Licencia en trámite"})
    assert r.status_code == 200 and r.json()["horizon"] == "Entrega inmediata", r.text
    assert client.patch(f"/admin/properties/{pid}", headers=H, json={"title": ""}).status_code == 422
    assert client.get(f"/admin/properties/{pid}", headers=H).json()["description_html"] == DOSSIER

    # 4. Propuesta de datos con IA (gateway simulado)
    captured = {}

    def fake_urlopen(req, timeout=0):
        captured["body"] = json.loads(req.data.decode())
        content = json.dumps({"title": "Villa Aurora", "location": "Sierra Blanca, Marbella",
                              "asset_type": "Villa", "investment_range": "4.950.000 €",
                              "horizon": None, "risk_notes": "null"})
        return FakeResponse(json.dumps({"choices": [{"message": {"content": content}}],
                                        "usage": {"prompt_tokens": 10, "completion_tokens": 5, "cost": 0.00001}}).encode())

    original = dossier_service.urllib.request.urlopen
    dossier_service.urllib.request.urlopen = fake_urlopen
    r = client.post("/admin/properties/extract-fields", headers=H, json={"text": text, "title_hint": "Villa Aurora"})
    assert r.status_code == 200, r.text
    fields = r.json()
    assert fields["investment_range"] == "4.950.000 €" and fields["horizon"] is None and fields["risk_notes"] is None, fields
    assert captured["body"]["temperature"] == 0

    def failing_urlopen(req, timeout=0):
        raise TimeoutError("sin respuesta")

    dossier_service.urllib.request.urlopen = failing_urlopen
    fields = client.post("/admin/properties/extract-fields", headers=H, json={"text": text, "title_hint": "Villa Aurora"}).json()
    assert fields["title"] == "Villa Aurora" and fields["location"] is None, "fallo de la IA: solo el título del documento"

    # 5. Recuperar dossier de Blob (solo dominio de Blob)
    s = TestSessionLocal()
    from models import Property
    legacy = s.get(Property, pid)
    legacy.dossier_html_url = "https://evil.example.com/x.html"
    s.commit()
    assert client.post(f"/admin/properties/{pid}/fetch-dossier-url", headers=H).status_code == 400
    legacy.dossier_html_url = "https://abc.public.blob.vercel-storage.com/propiedades/dossiers/villa.html"
    s.commit()
    s.close()
    dossier_service.urllib.request.urlopen = lambda req, timeout=0: FakeResponse(DOSSIER.encode("utf-8"))
    r = client.post(f"/admin/properties/{pid}/fetch-dossier-url", headers=H)
    assert r.status_code == 200 and r.json()["html"] == DOSSIER
    dossier_service.urllib.request.urlopen = original

    # "" quita dossier_html_url (ya está en description_html)
    r = client.patch(f"/admin/properties/{pid}/content", headers=H, json={"dossier_html_url": "", "description_html": DOSSIER})
    assert r.status_code == 200 and r.json()["dossier_html_url"] is None

    # 6. Catálogo público: portada en la lista, HTML en la ficha
    client.patch(f"/admin/properties/{pid}/status", headers=H, json={"status": "published"})
    pub = client.get("/properties").json()["properties"][0]
    assert pub["photos"] == ["https://x.public.blob.vercel-storage.com/cover.jpg"] and "description_html" not in pub
    assert client.get(f"/properties/{pid}").json()["description_html"] == DOSSIER

    # 7. Brigitte: texto del dossier como contexto
    s = TestSessionLocal()
    focus = ai_assistant.get_property_focus(s, pid)
    assert "6 dormitorios" in focus and "4.950.000 €" in focus and "querySelectorAll" not in focus, focus
    catalog = ai_assistant.build_context_prompt(ai_assistant.get_published_properties(s))
    assert "Dossier excerpt:" in catalog and "Villa contemporánea" in catalog
    s.close()

    # 8. Versión en inglés: se añade, se sirve en la ficha y Brigitte la usa en inglés
    DOSSIER_EN = DOSSIER.replace('lang="es"', 'lang="en"').replace(
        "Villa contemporánea de 6 dormitorios con vistas al mar.", "Contemporary 6-bedroom villa with sea views.")
    r = client.patch(f"/admin/properties/{pid}/content", headers=H, json={"description_html_en": DOSSIER_EN})
    assert r.status_code == 200 and r.json()["has_dossier_en"] is True and r.json()["dossier_en_kb"] >= 0, r.text
    assert client.get(f"/admin/properties/{pid}", headers=H).json()["description_html_en"] == DOSSIER_EN
    assert client.get(f"/admin/properties/{pid}", headers=H).json()["description_html"] == DOSSIER, "el español no cambia"
    public = client.get(f"/properties/{pid}").json()
    assert public["description_html_en"] == DOSSIER_EN and public["description_html"] == DOSSIER
    s = TestSessionLocal()
    assert "6-bedroom" in ai_assistant.get_property_focus(s, pid, "en")
    assert "6 dormitorios" in ai_assistant.get_property_focus(s, pid, "es")
    assert "6-bedroom" in ai_assistant.build_context_prompt(ai_assistant.get_published_properties(s, "en"))
    s.close()
    # "" quita la versión en inglés: en inglés se vuelve a mostrar el español
    r = client.patch(f"/admin/properties/{pid}/content", headers=H, json={"description_html_en": ""})
    assert r.json()["has_dossier_en"] is False
    s = TestSessionLocal()
    assert "6 dormitorios" in ai_assistant.get_property_focus(s, pid, "en")
    s.close()

    # 9. Columna nueva en una base de datos ya existente (producción): se añade al arrancar
    from sqlalchemy import inspect as sa_inspect, text as sa_text
    legacy_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    with legacy_engine.begin() as conn:
        conn.execute(sa_text("CREATE TABLE properties (id VARCHAR PRIMARY KEY, title VARCHAR, description_html TEXT)"))
    original_engine = main.engine
    main.engine = legacy_engine
    main.ensure_new_columns()
    main.ensure_new_columns()  # idempotente
    main.engine = original_engine
    cols = {c["name"] for c in sa_inspect(legacy_engine).get_columns("properties")}
    assert "description_html_en" in cols, cols

    print("OK: dossier como ficha verificado (alta, datos, IA, Blob, catálogo, Brigitte, inglés, migración)")


if __name__ == "__main__":
    main_test()
