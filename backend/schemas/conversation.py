"""
Schemas Pydantic para Conversation y Message.
Referencia: DATA_MODEL_AND_PERMISSIONS.md

Solo schemas de escritura mínimos según alcance de tarea.
"""

from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


# --- CREATE SCHEMAS (escritura) ---

class ConversationCreate(BaseModel):
    """
    Schema para crear una conversación.
    investor_id es opcional (puede ser anónimo inicialmente).
    """
    investor_id: Optional[str] = None


class MessageCreate(BaseModel):
    """
    Schema para añadir un mensaje a una conversación.
    """
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1)


class IntentScoreUpdate(BaseModel):
    """
    Schema para actualizar intent_score explícitamente.
    Solo se actualiza si se provee.
    """
    intent_score: int = Field(..., ge=0, le=100)


# --- RESPONSE SCHEMAS (lectura mínima para respuestas) ---

class MessageRead(BaseModel):
    """
    Schema de mensaje para respuestas.
    """
    id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationCreated(BaseModel):
    """
    Respuesta al crear una conversación.
    Solo devuelve el id.
    """
    id: str

    class Config:
        from_attributes = True


class MessageAdded(BaseModel):
    """
    Respuesta al añadir un mensaje.
    """
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
