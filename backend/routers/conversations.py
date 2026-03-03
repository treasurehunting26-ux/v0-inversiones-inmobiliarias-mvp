"""
Router de Conversaciones.
Referencia: MVP_TECHNICAL_BLUEPRINT.md, DATA_MODEL_AND_PERMISSIONS.md

Endpoints:
- POST /conversations - Crear conversación
- POST /conversations/{id}/messages - Añadir mensaje

Prohibiciones (según tarea):
- No cerrar conversaciones
- No crear lógica de decisión o scoring automático
- No escalar a humano automáticamente
- No modificar inversores ni propiedades
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.conversation import Conversation, Message
from backend.schemas.conversation import (
    ConversationCreate,
    ConversationCreated,
    MessageCreate,
    MessageAdded,
    IntentScoreUpdate,
)

router = APIRouter(
    prefix="/conversations",
    tags=["conversations"],
)


@router.post(
    "",
    response_model=ConversationCreated,
    status_code=status.HTTP_201_CREATED,
    summary="Crear conversación",
    description="Crea una nueva conversación. Opcionalmente asociada a un investor_id.",
)
def create_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db),
):
    """
    Crea una conversación y devuelve su id.
    
    El asistente puede crear conversaciones (DATA_MODEL_AND_PERMISSIONS.md).
    """
    conversation = Conversation(
        investor_id=data.investor_id,
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return ConversationCreated(id=conversation.id)


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageAdded,
    status_code=status.HTTP_201_CREATED,
    summary="Añadir mensaje a conversación",
    description="Añade un mensaje a una conversación existente.",
)
def add_message(
    conversation_id: str,
    data: MessageCreate,
    db: Session = Depends(get_db),
):
    """
    Añade un mensaje a una conversación.
    
    - Si la conversación no existe → 404.
    - Los mensajes quedan asociados y ordenados por created_at.
    """
    # Verificar que la conversación existe
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversación no encontrada",
        )

    # Crear y persistir mensaje
    message = Message(
        conversation_id=conversation_id,
        role=data.role,
        content=data.content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return MessageAdded(
        id=message.id,
        conversation_id=message.conversation_id,
        role=message.role,
        content=message.content,
        created_at=message.created_at,
    )


@router.patch(
    "/{conversation_id}/intent-score",
    status_code=status.HTTP_200_OK,
    summary="Actualizar intent_score",
    description="Actualiza el intent_score de una conversación si se provee explícitamente.",
)
def update_intent_score(
    conversation_id: str,
    data: IntentScoreUpdate,
    db: Session = Depends(get_db),
):
    """
    Actualiza intent_score solo si se provee explícitamente.
    
    El asistente puede actualizar intent_score (DATA_MODEL_AND_PERMISSIONS.md).
    No hay lógica de scoring automático.
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversación no encontrada",
        )

    conversation.intent_score = data.intent_score
    db.commit()

    return {"id": conversation_id, "intent_score": data.intent_score}
