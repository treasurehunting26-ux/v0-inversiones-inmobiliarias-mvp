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
import urllib.request
import urllib.error
import json
import os
import logging

from database import get_db
from models.conversation import Conversation, Message
from models.investor import Investor
from models.property import Property
from rate_limit import enforce_ai_rate_limit
from schemas.ai_assistant import AssistantRequest, AssistantResponse

logger = logging.getLogger("uvicorn.error")

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

MERCADOS (plataforma internacional):
- La plataforma opera en múltiples mercados de activos (Marbella/Costa del Sol,
  Madrid, otras zonas de España, Dubai/UAE y otros mercados internacionales).
- NUNCA asumas que un inversor busca invertir en el lugar donde reside o fue
  detectado. Un inversor en Dubai puede buscar Marbella, Madrid u otro mercado.
- Si se te proporciona el perfil de un Investor aprobado, úsalo solo para
  filtrar y presentar oportunidades compatibles con su mercado de interés,
  capacidad, preferencias y horizonte — nunca para decidir por él.

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


def get_investor_profile_context(investor: Optional[Investor]) -> str:
    """
    Construye un bloque de contexto de solo lectura con el perfil de un
    Investor ya aprobado, cuando exista. No expone datos internos ni de
    otros inversores.

    MERCADO DEL INVERSOR (dónde está) y MERCADO DEL ACTIVO PREFERIDO
    (dónde quiere invertir) se presentan como conceptos explícitamente
    distintos, para que el asistente nunca asuma que coinciden. Esto es
    solo contexto para filtrar y presentar oportunidades: el asistente
    sigue sin tomar la decisión de inversión.
    """
    if investor is None:
        return ""

    lines = ["PERFIL DEL INVERSOR (solo para filtrar y presentar oportunidades compatibles):"]
    if investor.investor_market or investor.investor_country or investor.investor_city:
        location = ", ".join(
            filter(None, [investor.investor_city, investor.investor_country, investor.investor_market])
        )
        lines.append(f"- Mercado del inversor (dónde está): {location}")
    if investor.preferred_property_market:
        lines.append(f"- Mercado del activo de interés (dónde quiere invertir): {investor.preferred_property_market}")
    if investor.preferred_asset_type:
        lines.append(f"- Tipo de activo preferido: {investor.preferred_asset_type}")
    if investor.estimated_investment_capacity or investor.budget_range:
        lines.append(
            f"- Capacidad estimada: {investor.estimated_investment_capacity or investor.budget_range}"
        )
    if investor.horizon:
        lines.append(f"- Horizonte de inversión: {investor.horizon}")

    if len(lines) == 1:
        return ""
    return "\n".join(lines)


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
        payload = json.dumps({
            "model": "openai/gpt-4o-mini",
            "messages": messages,
            "max_tokens": 500,
            "temperature": 0.7,
        }).encode("utf-8")

        # Acepta ambos nombres de variable para mayor tolerancia de configuracion
        api_key = (
            os.environ.get("AI_GATEWAY_API_KEY")
            or os.environ.get("VERCEL_AI_GATEWAY_KEY")
            or ""
        )
        req = urllib.request.Request(
            "https://ai-gateway.vercel.sh/v1/chat/completions",
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            assistant_response = data["choices"][0]["message"]["content"]

            escalate_keywords = [
                "especialista se pondrá en contacto",
                "un asesor te contactará",
                "hablar con una persona",
                "contacto humano",
            ]
            escalate = any(kw in assistant_response.lower() for kw in escalate_keywords)

            return assistant_response, escalate

    except urllib.error.HTTPError as exc:
        # Log del cuerpo real del error (clave invalida, modelo inexistente, etc.)
        try:
            detail = exc.read().decode("utf-8")[:500]
        except Exception:  # noqa: BLE001
            detail = "(sin cuerpo)"
        logger.error("[ai] HTTPError %s del AI Gateway: %s", exc.code, detail)
        return (
            "Estamos experimentando dificultades técnicas. "
            "Un especialista de nuestro equipo se pondrá en contacto contigo pronto.",
            True
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("[ai] Fallo al llamar al AI Gateway: %s: %s", exc.__class__.__name__, exc)
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
    _rate_limit: None = Depends(enforce_ai_rate_limit),
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

    # 2b. Si hay un Investor aprobado asociado, añade su perfil como
    # contexto de solo lectura (mercado del inversor vs. mercado del
    # activo preferido, nunca se igualan entre sí).
    investor = (
        db.query(Investor).filter(Investor.id == request.investor_id).first()
        if request.investor_id
        else None
    )
    investor_context = get_investor_profile_context(investor)
    if investor_context:
        context = f"{context}\n\n{investor_context}"

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
