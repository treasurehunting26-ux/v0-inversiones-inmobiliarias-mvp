"""
Schemas Pydantic: Contact (Punto de contacto humano)
Referencia: WEB_STRUCTURE_AND_FLOWS.md (seccion 6)

Canal secundario de contacto directo. Crea un Investor + LeadEscalation.
Formulario breve: nombre, email, contexto.
"""

import re

from pydantic import BaseModel, Field, field_validator

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ContactCreate(BaseModel):
    """
    Schema para el formulario de contacto humano.
    Solo campos minimos (seccion 6: 'Formulario breve').
    """
    name: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Nombre del inversor",
    )
    email: str = Field(
        ...,
        max_length=320,
        description="Email de contacto",
    )

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not _EMAIL_RE.match(v):
            raise ValueError("Email no valido")
        return v
    context: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Contexto o motivo de contacto",
    )


class ContactCreated(BaseModel):
    """
    Respuesta tras registrar el contacto.
    Solo confirma recepcion, sin exponer estado interno.
    """
    id: str = Field(..., description="ID del escalado creado")
    status: str = Field(default="received", description="Estado de la solicitud")
