"""
Schemas Pydantic: LeadEscalation
Referencia: DATA_MODEL_AND_PERMISSIONS.md

Solo schemas de creación. No hay schemas de actualización
porque el asistente no puede modificar escalados.
"""

from pydantic import BaseModel, Field


class LeadEscalationCreate(BaseModel):
    """
    Schema para crear un escalado.
    Solo campos mínimos requeridos.
    """
    investor_id: str = Field(
        ...,
        description="ID del inversor a escalar"
    )
    reason: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Motivo del escalado a humano"
    )


class LeadEscalationCreated(BaseModel):
    """
    Respuesta tras crear escalado.
    Solo devuelve el ID, sin exponer estado interno.
    """
    id: str = Field(..., description="ID del escalado creado")

    class Config:
        from_attributes = True
