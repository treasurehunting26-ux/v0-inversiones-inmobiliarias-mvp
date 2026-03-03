"""
Modelos SQLAlchemy para Conversation y Message.
Referencia: DATA_MODEL_AND_PERMISSIONS.md
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from backend.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Conversation(Base):
    """
    Historial de interacción asistente <-> inversor.
    
    Reglas (DATA_MODEL_AND_PERMISSIONS.md):
    - El asistente puede escribir mensajes
    - El asistente puede actualizar intent_score
    - El asistente puede solicitar escalado
    - El cierre del escalado es humano
    """
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=generate_uuid)
    investor_id = Column(String, nullable=True)  # Puede ser anónimo inicialmente
    intent_score = Column(Integer, nullable=True)
    escalated_to_human = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relación con mensajes
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")


class Message(Base):
    """
    Mensaje individual dentro de una conversación.
    """
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False)  # "user" | "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relación inversa
    conversation = relationship("Conversation", back_populates="messages")
