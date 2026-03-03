"""
Router AI Assistant.
Referencia: MVP_TECHNICAL_BLUEPRINT.md, ASSISTANT_MASTER_PROMPT.md, AI_RUNTIME_AND_COST_GUARDRAILS.md

PROPOSITO:
Punto unico de interaccion entre frontend y asistente.
Orquesta conversacion, lectura de propiedades y respuesta.

ALCANCE:
- Recibir mensaje del usuario
- Crear/reutilizar conversacion
- Leer propiedades publicadas (contexto)
- Generar respuesta del asistente
- Persistir mensajes

PROHIBICIONES:
- No scoring automatico
- No modificar propiedades
- No cerrar conversaciones
- No asignar humanos
- No escalado implicito
- No persistir prompts ni reasoning
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import httpx

from database import get_db
from models.conversation import Conversation, Message
from models.property import Property
from schemas.ai_assistant import AssistantRequest, AssistantResponse

router = APIRouter(
    prefix="/ai",
    tags=["ai-assistant"],
)

# System prompt basado en ASSISTANT_MASTER_PROMPT.md
SYSTEM_PROMPT = """Actúas como Asistente Inteligente para Inversionistas Inmobiliarios.

Tu función es asistir, explicar, cualificar y preparar. Nunca decidir, ejecutar ni modificar estados críticos.

ALCANCE:
- Conversar de forma profesional y clara
- Explicar oportunidades inmobiliarias existentes
- Responder sobre ROI, horizonte, riesgo, ubicación
- Calcular ROI solo con datos proporcionados
- Cualificar perfiles de inversores
- Escalar a humano cuando exista intención real

PROHIBICIONES:
- No inventar propiedades
- No modificar datos
- No tomar decisiones de inversión
- No simular información no existente

TONO: Profesional, claro, seguro, sin exageraciones ni promesas.

Si una solicitud cae fuera de tu alcance, indica que un especialista se pondrá en contacto."""


def get_published_properties(db: Session) -> list[dict]:
    """
    Lee propiedades publicadas para contexto del asistente.
    Solo lectura, filtro status = "published" en SQL.
    """
    properties = db.query(Property).filter(
        Property.status == "published"
    ).all()
    
    return [
        {
            "id": p.id,
            "title": p.title,
            "location": p.location,
            "asset_type": p.asset_type,
            "investment_range": p.investment_range,
            "roi_estimated": p.roi_estimated,
            "horizon": p.horizon,
            "risk_notes": p.risk_notes,
        }
        for p in properties
    ]


def get_conversation_history(db: Session, conversation_id: str) -> list[dict]:
    """
    Obtiene historial de mensajes de una conversacion.
    Ordenado por created_at ascendente.
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        return []
    
    return [
        {"role": m.role, "content": m.content}
        for m in sorted(conversation.messages, key=lambda x: x.created_at)
    ]


def build_context_prompt(properties: list[dict]) -> str:
    """
    Construye prompt de contexto con propiedades disponibles.
    No expone campos internos.
    """
    if not properties:
        return "Actualmente no hay oportunidades de inversión publicadas."
    
    context = "OPORTUNIDADES DE INVERSIÓN DISPONIBLES:\n\n"
    for p in properties:
        context += f"- {p['title']}\n"
        context += f"  Ubicación: {p['location']}\n"
        context += f"  Tipo: {p['asset_type']}\n"
        context += f"  Rango de inversión: {p['investment_range']}\n"
        if p['roi_estimated']:
            context += f"  ROI estimado: {p['roi_estimated']}\n"
        context += f"  Horizonte: {p['horizon']}\n"
        context += f"  Notas de riesgo: {p['risk_notes']}\n\n"
    
    return context


async def call_ai_model(
    system_prompt: str,
    context: str,
    history: list[dict],
    user_message: str,
) -> tuple[str, bool]:
    """
    Llama al modelo de IA via Vercel AI Gateway.
    
    Retorna: (respuesta, escalate_to_human)
    
    Falla de forma segura: si hay error, retorna mensaje de fallback.
    No persiste prompts ni reasoning interno.
    """
    # Construir mensajes para el modelo
    messages = [
        {"role": "system", "content": f"{system_prompt}\n\n{context}"},
    ]
    
    # Agregar historial (limitado para control de costes)
    # AI_RUNTIME_AND_COST_GUARDRAILS: contextos cortos en fase validacion
    max_history = 10
    messages.extend(history[-max_history:])
    
    # Agregar mensaje actual
    messages.append({"role": "user", "content": user_message})
    
    try:
        # Llamada al AI Gateway (timeout para control)
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.vercel.ai/v1/chat/completions",
                json={
                    "model": "openai/gpt-4o-mini",  # Modelo economico para MVP
                    "messages": messages,
                    "max_tokens": 500,  # Limite de tokens por respuesta
                    "temperature": 0.7,
                },
                headers={
                    "Authorization": "Bearer ${AI_GATEWAY_API_KEY}",
                    "Content-Type": "application/json",
                },
            )
            
            if response.status_code == 200:
                data = response.json()
                assistant_response = data["choices"][0]["message"]["content"]
                
                # Detectar si sugiere escalado (sin automatizar)
                escalate_keywords = [
                    "especialista se pondrá en contacto",
                    "un asesor te contactará",
                    "hablar con una persona",
                    "contacto humano",
                ]
                escalate = any(kw in assistant_response.lower() for kw in escalate_keywords)
                
                return assistant_response, escalate
            else:
                # Fallo seguro: mensaje de fallback
                return (
                    "En este momento no puedo procesar tu consulta. "
                    "Un especialista de nuestro equipo se pondrá en contacto contigo.",
                    True
                )
    except Exception:
        # ERROR_HANDLING: ante error, fallo seguro y escalado
        return (
            "Estamos experimentando dificultades técnicas. "
            "Un especialista de nuestro equipo se pondrá en contacto contigo pronto.",
            True
        )


@router.post(
    "/assistant",
    response_model=AssistantResponse,
    status_code=status.HTTP_200_OK,
    summary="Interactuar con el asistente",
    description="Punto único de interacción con el asistente inteligente.",
)
async def interact_with_assistant(
    request: AssistantRequest,
    db: Session = Depends(get_db),
):
    """
    POST /ai/assistant
    
    Orquesta:
    1. Crea o reutiliza conversación
    2. Lee propiedades publicadas (contexto)
    3. Obtiene historial de conversación
    4. Genera respuesta del asistente
    5. Persiste mensajes (usuario + asistente)
    
    No ejecuta:
    - Scoring automático
    - Escalado automático
    - Modificación de datos
    - Cierre de conversaciones
    """
    
    # 1. Obtener o crear conversación
    conversation_id = request.conversation_id
    
    if conversation_id:
        # Verificar que existe
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversación no encontrada",
            )
    else:
        # Crear nueva conversación
        conversation = Conversation(
            investor_id=request.investor_id,
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        conversation_id = conversation.id
    
    # 2. Leer propiedades publicadas (solo lectura, filtro en SQL)
    properties = get_published_properties(db)
    context = build_context_prompt(properties)
    
    # 3. Obtener historial de conversación
    history = get_conversation_history(db, conversation_id)
    
    # 4. Persistir mensaje del usuario
    user_message = Message(
        conversation_id=conversation_id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    db.commit()
    
    # 5. Generar respuesta del asistente
    assistant_response, escalate = await call_ai_model(
        system_prompt=SYSTEM_PROMPT,
        context=context,
        history=history,
        user_message=request.message,
    )
    
    # 6. Persistir respuesta del asistente
    assistant_message = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=assistant_response,
    )
    db.add(assistant_message)
    db.commit()
    
    # 7. Retornar respuesta (sin persistir reasoning ni prompts)
    return AssistantResponse(
        conversation_id=conversation_id,
        response=assistant_response,
        escalate_to_human=escalate,
    )
