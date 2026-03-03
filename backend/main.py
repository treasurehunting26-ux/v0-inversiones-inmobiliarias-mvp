"""
Punto de entrada FastAPI.
Referencia: MVP_TECHNICAL_BLUEPRINT.md
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import properties, conversations, lead_escalations, ai_assistant

app = FastAPI(
    title="Inversiones Inmobiliarias API",
    description="API del MVP para captación de inversionistas cualificados",
    version="0.1.0"
)

# CORS para frontend Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(properties.router)
app.include_router(conversations.router)
app.include_router(lead_escalations.router)
app.include_router(ai_assistant.router)


@app.get("/health")
def health_check():
    """Endpoint de salud."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
