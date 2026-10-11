"""
Punto de entrada FastAPI.
Referencia: MVP_TECHNICAL_BLUEPRINT.md
"""

import os
import logging
import traceback
import uuid
from fastapi import FastAPI, Header, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from database import engine, Base

logger = logging.getLogger("uvicorn.error")
import models  # noqa: F401  (necesario para que SQLAlchemy registre las tablas)
from routers import (
    properties,
    conversations,
    lead_escalations,
    ai_assistant,
    admin_properties,
    contact,
    prospecting,
    prospecting_sources,
    admin_leads,
    admin_ai_usage,
)

app = FastAPI(
    title="Inversiones Inmobiliarias API",
    description="API del MVP para captacion de inversionistas cualificados",
    version="0.1.0",
)


@app.on_event("startup")
def on_startup() -> None:
    """
    Crea las tablas en la base de datos si no existen.
    Idempotente: SQLAlchemy comprueba antes de crear.
    No detiene el arranque si falla, para que /health y /health/db
    sigan respondiendo y permitan diagnosticar el problema.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("[startup] Tablas verificadas/creadas correctamente")
    except Exception as exc:  # noqa: BLE001
        logger.error("[startup] Fallo al crear tablas: %s: %s", exc.__class__.__name__, exc)
    ensure_new_columns()


# Columnas anadidas a tablas que ya existen en produccion. create_all no
# modifica tablas existentes: se anaden aqui al arrancar (idempotente y
# portable: se comprueba con el inspector antes de hacer ALTER TABLE).
NEW_COLUMNS = [
    ("properties", "description_html_en", "TEXT"),
    ("properties", "category", "VARCHAR(32)"),
]


def ensure_new_columns() -> None:
    from sqlalchemy import inspect, text

    try:
        inspector = inspect(engine)
        for table, column, sql_type in NEW_COLUMNS:
            if not inspector.has_table(table):
                continue
            existing = {c["name"] for c in inspector.get_columns(table)}
            if column not in existing:
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {sql_type}"))
                logger.info("[startup] Columna anadida: %s.%s", table, column)
    except Exception as exc:  # noqa: BLE001
        logger.error("[startup] Fallo al anadir columnas: %s: %s", exc.__class__.__name__, exc)


# CORS: permite frontend local + dominio de produccion + Vercel preview.
# El dominio de produccion siempre esta permitido, aunque ALLOWED_ORIGINS
# no se haya configurado en Railway (evita que el sitio quede roto por un
# olvido de configuracion).
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
default_origins = [
    "http://localhost:3000",
    "https://bgestateconsulting.com",
    "https://www.bgestateconsulting.com",
]
extra_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
allowed_origins = list(dict.fromkeys(default_origins + extra_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # Cubre tambien previews de Vercel (*.vercel.app) y cualquier subdominio
    # del dominio de produccion (ej. www.).
    allow_origin_regex=r"https://(.*\.vercel\.app|(.*\.)?bgestateconsulting\.com|.*\.vusercontent\.net|.*\.v0\.(app|dev))",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(properties.router)
app.include_router(conversations.router)
app.include_router(lead_escalations.router)
app.include_router(ai_assistant.router)
app.include_router(admin_properties.router)
app.include_router(contact.router)
app.include_router(prospecting.router)
app.include_router(prospecting_sources.router)
app.include_router(admin_leads.router)
app.include_router(admin_ai_usage.router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """
    Errores no controlados: el detalle tecnico va SOLO a los logs.
    Al publico se le devuelve un mensaje generico con un codigo para poder
    localizar el error en los logs (DEPLOYMENT_AND_ENVIRONMENT_RULES.md:
    nada de detalles internos en el frontend).
    """
    error_id = uuid.uuid4().hex[:12]
    logger.error(
        "[error %s] %s en %s\n%s", error_id, exc, request.url.path, traceback.format_exc()
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor", "error_id": error_id},
    )


@app.get("/health")
def health_check():
    """Endpoint de salud."""
    return {"status": "ok"}


@app.get("/health/db")
def health_db(x_admin_token: str = Header(default="")):
    """
    Comprueba la conexion real a PostgreSQL.
    Publico: solo ok/error. Con X-Admin-Token valido: tablas y detalle del error
    (para diagnosticar sin exponer la infraestructura a cualquiera).
    """
    expected = os.getenv("ADMIN_TOKEN", "")
    is_admin = bool(expected) and x_admin_token == expected
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            if not is_admin:
                return {"db": "ok"}
            tables = [
                row[0]
                for row in conn.execute(
                    text(
                        "SELECT table_name FROM information_schema.tables "
                        "WHERE table_schema = 'public' ORDER BY table_name"
                    )
                )
            ]
        return {"db": "ok", "tables": tables}
    except Exception as exc:  # noqa: BLE001
        logger.error("[health/db] %s: %s", exc.__class__.__name__, exc)
        content = {"db": "error"}
        if is_admin:
            content.update({"detail": str(exc), "type": exc.__class__.__name__})
        return JSONResponse(status_code=500, content=content)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
