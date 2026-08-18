"""
Punto de entrada FastAPI.
Referencia: MVP_TECHNICAL_BLUEPRINT.md
"""

import os
import logging
import traceback
from fastapi import FastAPI, Request
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


# CORS: permite frontend local + Vercel preview/produccion
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
default_origins = [
    "http://localhost:3000",
]
allowed_origins = [
    o.strip() for o in allowed_origins_env.split(",") if o.strip()
] or default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
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


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """
    Captura errores no controlados y devuelve el detalle real.
    Necesario para diagnosticar el MVP (conexion DB, tablas, driver...).
    """
    logger.error("[error] %s en %s\n%s", exc, request.url.path, traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "type": exc.__class__.__name__,
            "path": request.url.path,
        },
    )


@app.get("/health")
def health_check():
    """Endpoint de salud."""
    return {"status": "ok"}


@app.get("/health/db")
def health_db():
    """
    Comprueba la conexion real a PostgreSQL y lista las tablas existentes.
    Permite verificar si DATABASE_URL esta bien enlazada.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
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
        return JSONResponse(
            status_code=500,
            content={
                "db": "error",
                "detail": str(exc),
                "type": exc.__class__.__name__,
            },
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
