"""
Schemas para AI Assistant (Brigitte).
Referencia: MVP_TECHNICAL_BLUEPRINT.md, ASSISTANT_MASTER_PROMPT.md

Solo define input/output de los endpoints.
No expone datos internos ni reasoning.
"""

import re
from typing import Optional

from pydantic import BaseModel, Field, field_validator

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_LOCALE_RE = re.compile(r"^[a-z]{2}$")


def _normalize_locale(v: Optional[str]) -> Optional[str]:
    if v is None:
        return None
    v = v.strip().lower()[:2]
    return v if _LOCALE_RE.match(v) else None


class AssistantRequest(BaseModel):
    """Request para POST /ai/assistant."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Mensaje del usuario",
    )
    conversation_id: Optional[str] = Field(
        default=None,
        description="ID de conversación existente. Si no existe, se crea una nueva.",
    )
    investor_id: Optional[str] = Field(
        default=None,
        description="ID de inversor asociado (opcional).",
    )
    locale: Optional[str] = Field(
        default=None,
        description="Idioma de la web desde la que escribe (es, en...). Brigitte responde en el idioma del visitante.",
    )
    property_id: Optional[str] = Field(
        default=None,
        max_length=64,
        description="Propiedad publicada desde cuya ficha se abrió el chat (contexto).",
    )

    @field_validator("locale")
    @classmethod
    def normalize_locale(cls, v: Optional[str]) -> Optional[str]:
        return _normalize_locale(v)


class AssistantResponse(BaseModel):
    """Response de POST /ai/assistant."""

    conversation_id: str = Field(
        ...,
        description="ID de la conversación (nueva o existente).",
    )
    response: str = Field(
        ...,
        description="Respuesta del asistente.",
    )
    escalate_to_human: bool = Field(
        default=False,
        description="True cuando el visitante ha aceptado hablar con una persona: el chat muestra el formulario de contacto.",
    )


class HandoffRequest(BaseModel):
    """Request para POST /ai/assistant/handoff: el visitante pide que le contacte una persona."""

    conversation_id: str = Field(..., max_length=64)
    name: str = Field(..., min_length=1, max_length=200)
    email: str = Field(..., max_length=320)
    phone: Optional[str] = Field(default=None, max_length=40)
    locale: Optional[str] = Field(default=None)
    property_id: Optional[str] = Field(default=None, max_length=64)

    @field_validator("locale")
    @classmethod
    def normalize_locale(cls, v: Optional[str]) -> Optional[str]:
        return _normalize_locale(v)

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Nombre obligatorio")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not _EMAIL_RE.match(v):
            raise ValueError("Email no valido")
        return v

    @field_validator("phone")
    @classmethod
    def strip_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        return v or None


class HandoffResponse(BaseModel):
    id: Optional[str] = Field(default=None, description="ID del escalado creado.")
    status: str = Field(..., description="received | already_received")


class AssistantError(BaseModel):
    """Error response."""

    error: str = Field(..., description="Mensaje de error.")
    code: str = Field(..., description="Código de error.")
