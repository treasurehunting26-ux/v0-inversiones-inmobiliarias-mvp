"""
Punto de entrada FastAPI.
Referencia: MVP_TECHNICAL_BLUEPRINT.md
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
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
    """
    Base.metadata.create_all(bind=engine)


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


@app.get("/health")
def health_check():
    """Endpoint de salud."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
