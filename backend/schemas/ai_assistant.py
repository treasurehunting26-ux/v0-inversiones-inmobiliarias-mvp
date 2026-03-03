"""
Schemas para AI Assistant.
Referencia: MVP_TECHNICAL_BLUEPRINT.md, ASSISTANT_MASTER_PROMPT.md

Solo define input/output del endpoint.
No expone datos internos ni reasoning.
"""

from pydantic import BaseModel, Field
from typing import Optional


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
        description="Indica si el asistente sugiere escalado a humano.",
    )


class AssistantError(BaseModel):
    """Error response."""
    
    error: str = Field(..., description="Mensaje de error.")
    code: str = Field(..., description="Código de error.")
