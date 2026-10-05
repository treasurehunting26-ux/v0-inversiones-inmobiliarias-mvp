"""
Router AI Assistant — Brigitte.
Referencia: MVP_TECHNICAL_BLUEPRINT.md, ASSISTANT_MASTER_PROMPT.md,
AI_RUNTIME_AND_COST_GUARDRAILS.md, DATA_MODEL_AND_PERMISSIONS.md,
WEB_STRUCTURE_AND_FLOWS.md (seccion 3)

PROPOSITO:
Punto unico de interaccion entre la web y Brigitte, la asistente virtual.
Cubre el flujo canonico (MVP_TECHNICAL_BLUEPRINT.md 3.1):
  asistente inicia conversacion -> se crea Investor + Conversation ->
  cualifica -> presenta oportunidades existentes -> el visitante muestra
  intencion -> se crea LeadEscalation -> el humano toma el control.

TRANSPARENCIA (Reglamento de IA de la UE, art. 50):
Brigitte se presenta como asistente virtual desde el primer mensaje del
chat y nunca afirma ni da a entender que es una persona.

PERMISOS (DATA_MODEL_AND_PERMISSIONS.md):
- Lee solo propiedades publicadas.
- Crea el Investor y actualiza SOLO sus campos de cualificacion, y solo
  con lo que el visitante ha dicho explicitamente (nunca inferido).
- Crea LeadEscalation (status=open). Nunca la cierra ni asigna humano.
- No modifica propiedades ni estados criticos.

PROHIBICIONES:
- No persistir prompts ni reasoning (solo el texto visible de la respuesta).
- No inventar propiedades, precios ni rentabilidades.
"""

import json
import logging
import os
import re
import urllib.error
import urllib.request
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from emailer import send_lead_notification
from models.conversation import Conversation, Message
from models.investor import Investor, QualificationStatus
from models.lead_escalation import EscalationStatus, LeadEscalation
from models.property import Property
from rate_limit import enforce_ai_rate_limit
from services.ai_usage import budget_exhausted, record_usage
from schemas.ai_assistant import (
    AssistantRequest,
    AssistantResponse,
    HandoffRequest,
    HandoffResponse,
)

logger = logging.getLogger("uvicorn.error")

router = APIRouter(
    prefix="/ai",
    tags=["ai-assistant"],
)

MODEL = "openai/gpt-4o-mini"
MAX_HISTORY = 12  # AI_RUNTIME_AND_COST_GUARDRAILS: contexto acotado
MAX_TOKENS = 450
FIELD_MAX = 120

LANGUAGE_NAMES = {
    "es": "Spanish",
    "en": "English",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "nl": "Dutch",
    "ru": "Russian",
    "ar": "Arabic",
}

# Campos de cualificacion que Brigitte puede rellenar en el Investor.
PROFILE_FIELDS = (
    "investment_goal",
    "budget_range",
    "preferred_property_market",
    "preferred_asset_type",
    "horizon",
    "risk_profile",
)

PROFILE_LABELS_ES = {
    "investment_goal": "Objetivo",
    "budget_range": "Presupuesto",
    "preferred_property_market": "Mercado de interés",
    "preferred_asset_type": "Tipo de activo",
    "horizon": "Horizonte",
    "risk_profile": "Perfil de riesgo",
}

INTENT_SCORES = {"low": 25, "medium": 55, "high": 85}

QUALIFICATION_ORDER = {
    QualificationStatus.UNQUALIFIED.value: 0,
    QualificationStatus.QUALIFIED.value: 1,
    QualificationStatus.HIGH_INTENT.value: 2,
}

FALLBACK_MESSAGES = {
    "es": (
        "Perdona, ahora mismo estoy teniendo un problema técnico. Si quieres, déjame tus datos "
        "aquí abajo y alguien de nuestro equipo te escribe directamente."
    ),
    "en": (
        "Sorry, I'm having a technical issue right now. If you like, leave your details just below "
        "and someone from our team will write to you directly."
    ),
}

# Prompt de sistema (en ingles: el modelo responde en el idioma del visitante).
# Basado en ASSISTANT_MASTER_PROMPT.md v1.1 (persona Brigitte).
SYSTEM_PROMPT = """You are Brigitte, the virtual assistant of B&G Consulting, a boutique firm that helps private investors find high-value real estate in Europe (Marbella and the Costa del Sol, Madrid, Lisbon...), Latin America and Dubai.

WHO YOU ARE
- You are an AI assistant and the visitor already knows it: the chat window introduced you as B&G Consulting's virtual assistant. Never claim or imply that you are a human. Don't invent a personal life, age, location or feelings.
- If someone asks whether you are a person or a bot, answer honestly and warmly in one sentence (you are B&G Consulting's virtual assistant) and offer to put them in touch with someone from the team.
- You have already greeted the visitor. Don't introduce yourself again unless asked.

HOW YOU TALK
- Like an experienced, warm private-client advisor writing a WhatsApp message: natural, attentive, discreet. Never robotic, never pushy.
- Short replies: usually 2 to 4 sentences. Plain text only: no lists, no bullet points, no bold, no headings, no emojis.
- First react to what the visitor actually said, then ask at most ONE question.
- Write in the visitor's language. If unclear, use {language}. In Spanish, use "tú" unless the visitor uses "usted"; then switch to "usted". In other languages, use a natural, polite register.
- Never use stock phrases such as "As an AI", "Great question!", "I understand your concern", "Feel free to", "I'm here to help", "No dispongo de información suficiente". Vary your wording.

WHAT YOU WANT TO LEARN, naturally over the conversation, never as a questionnaire
1. What they are looking for: rental income, capital growth, a second home or own use, diversification...
2. Approximate budget.
3. Preferred market or area, and/or type of property.
4. Time horizon: when they would like to buy and how long they would hold.
Where the visitor lives is NOT where they want to invest. Never assume one from the other.

WHAT YOU CAN TALK ABOUT
- Only the opportunities listed under AVAILABLE OPPORTUNITIES. Never invent properties, prices, returns, yields, dates or legal or tax facts. If a detail is not listed, say you would rather have the team confirm it than guess.
- General, non-personal context about the markets is fine. Never promise or estimate returns. No legal, tax or financial advice: that is for the team and the investor's own advisors.
- If nothing fits, say so honestly and offer to have the team let them know when something suitable appears.
- You never decide for the investor, never approve or close anything.

PASSING TO A PERSON
- Offer to connect the visitor with someone from the team when they ask for a person; want to visit, reserve, make an offer or buy; ask about legal, tax or financing specifics; show clear intent; or ask something you cannot answer.
- Set "handoff" to true ONLY when the visitor has accepted or asked to be contacted. In that reply, tell them you are passing the conversation to the team and that a short form for their name and contact details appears just below. Never ask for their email or phone number in the text yourself.

OUTPUT
Return ONLY a JSON object, with no text before or after it:
{"reply": "...", "profile": {"investment_goal": null, "budget_range": null, "preferred_property_market": null, "preferred_asset_type": null, "horizon": null, "risk_profile": null}, "intent": "low", "handoff": false}
- "reply": your message to the visitor.
- "profile": fill a field only with what the visitor has explicitly said in this conversation, briefly and in their own words (for example "1-2 M€", "Marbella", "rental income", "within a year"). Otherwise null. Never infer.
- "intent": "low", "medium" or "high": how ready the visitor seems to invest.
- "handoff": true or false, as explained above."""


def language_name(locale: Optional[str]) -> str:
    return LANGUAGE_NAMES.get(locale or "es", "English")


def fallback_message(locale: Optional[str]) -> str:
    return FALLBACK_MESSAGES.get(locale or "es", FALLBACK_MESSAGES["en"])


def get_published_properties(db: Session) -> list[dict]:
    """Propiedades publicadas para el contexto. Solo lectura, filtro en SQL."""
    properties = db.query(Property).filter(Property.status == "published").all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "location": p.location,
            "asset_type": p.asset_type,
            "investment_range": p.investment_range,
            "horizon": p.horizon,
            "risk_notes": p.risk_notes,
        }
        for p in properties
    ]


def get_conversation_history(db: Session, conversation_id: str) -> list[dict]:
    """Historial de mensajes, ordenado por created_at."""
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return [{"role": m.role, "content": m.content} for m in messages]


def build_context_prompt(properties: list[dict]) -> str:
    """Bloque de contexto con las propiedades disponibles. No expone campos internos."""
    if not properties:
        return "AVAILABLE OPPORTUNITIES:\nThere are no published opportunities right now."

    lines = ["AVAILABLE OPPORTUNITIES (the only ones you may mention; data as entered by the team):"]
    for p in properties:
        lines.append(
            f"- {p['title']} | Location: {p['location']} | Type: {p['asset_type']} | "
            f"Investment range: {p['investment_range']} | Horizon: {p['horizon']} | "
            f"Risk notes: {p['risk_notes']}"
        )
    return "\n".join(lines)


def get_property_focus(db: Session, property_id: Optional[str]) -> str:
    """Si el chat se abrio desde la ficha de una propiedad publicada, se indica al modelo."""
    if not property_id:
        return ""
    prop = (
        db.query(Property)
        .filter(Property.id == property_id, Property.status == "published")
        .first()
    )
    if not prop:
        return ""
    return (
        "VISITOR CONTEXT:\nThe visitor opened the chat from the page of this opportunity: "
        f"{prop.title} ({prop.location}). Assume their questions refer to it unless they say otherwise."
    )


def get_investor_profile_context(investor: Optional[Investor]) -> str:
    """
    Perfil ya conocido del inversor, solo para no volver a preguntar y para
    filtrar oportunidades compatibles. Mercado del inversor (donde esta) y
    mercado del activo (donde quiere invertir) se presentan por separado:
    nunca se asume que coinciden.
    """
    if investor is None:
        return ""

    lines = ["WHAT YOU ALREADY KNOW ABOUT THIS VISITOR (do not ask again):"]
    if investor.investor_market or investor.investor_country or investor.investor_city:
        location = ", ".join(
            filter(None, [investor.investor_city, investor.investor_country, investor.investor_market])
        )
        lines.append(f"- Where the investor is based: {location}")
    for field, label in (
        ("investment_goal", "Goal"),
        ("budget_range", "Budget"),
        ("preferred_property_market", "Market they want to invest in"),
        ("preferred_asset_type", "Preferred property type"),
        ("horizon", "Horizon"),
        ("risk_profile", "Risk profile"),
    ):
        value = getattr(investor, field, None)
        if value:
            lines.append(f"- {label}: {value}")
    if investor.estimated_investment_capacity and not investor.budget_range:
        lines.append(f"- Estimated capacity: {investor.estimated_investment_capacity}")

    return "\n".join(lines) if len(lines) > 1 else ""


_MARKDOWN = re.compile(r"(\*\*|__|^#+\s*|^\s*[-*•]\s+)", re.MULTILINE)


def clean_reply(text: str) -> str:
    """Quita restos de markdown: el chat muestra texto plano."""
    return _MARKDOWN.sub("", text).strip()


def parse_model_output(content: str) -> dict:
    """
    Interpreta la salida JSON del modelo. Si no es JSON valido, se usa el
    texto tal cual como respuesta (sin perfil ni handoff): fallar con
    seguridad, nunca romper la conversacion.
    """
    result = {"reply": "", "profile": {}, "intent": None, "handoff": False}
    text = (content or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)

    try:
        data = json.loads(text)
    except (json.JSONDecodeError, TypeError):
        match = re.search(r"\{.*\}", text, re.DOTALL)
        try:
            data = json.loads(match.group(0)) if match else None
        except json.JSONDecodeError:
            data = None

    if not isinstance(data, dict):
        result["reply"] = clean_reply(text)
        return result

    reply = data.get("reply")
    result["reply"] = clean_reply(reply) if isinstance(reply, str) else ""

    profile = data.get("profile")
    if isinstance(profile, dict):
        for field in PROFILE_FIELDS:
            value = profile.get(field)
            if isinstance(value, str) and value.strip() and value.strip().lower() not in ("null", "none", "n/a"):
                result["profile"][field] = value.strip()[:FIELD_MAX]

    intent = data.get("intent")
    if intent in INTENT_SCORES:
        result["intent"] = intent

    result["handoff"] = data.get("handoff") is True
    return result


async def call_ai_model(
    system_prompt: str,
    history: list[dict],
    user_message: str,
    conversation_id: Optional[str] = None,
) -> Optional[str]:
    """
    Llama al modelo via Vercel AI Gateway. Devuelve el contenido en bruto,
    o None si falla (el llamador responde con el mensaje de respaldo).
    """
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history[-MAX_HISTORY:])
    messages.append({"role": "user", "content": user_message})

    payload = json.dumps(
        {
            "model": MODEL,
            "messages": messages,
            "max_tokens": MAX_TOKENS,
            "temperature": 0.6,
            "response_format": {"type": "json_object"},
        }
    ).encode("utf-8")

    api_key = os.environ.get("AI_GATEWAY_API_KEY") or os.environ.get("VERCEL_AI_GATEWAY_KEY") or ""
    req = urllib.request.Request(
        "https://ai-gateway.vercel.sh/v1/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            record_usage(data, feature="assistant", model=MODEL, conversation_id=conversation_id)
            return data["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as exc:
        try:
            detail = exc.read().decode("utf-8")[:500]
        except Exception:  # noqa: BLE001
            detail = "(sin cuerpo)"
        logger.error("[ai] HTTPError %s del AI Gateway: %s", exc.code, detail)
    except Exception as exc:  # noqa: BLE001
        logger.error("[ai] Fallo al llamar al AI Gateway: %s: %s", exc.__class__.__name__, exc)
    return None


def apply_profile(investor: Investor, profile: dict, intent: Optional[str], handoff: bool) -> None:
    """
    Actualiza los campos de cualificacion con lo que el visitante ha dicho.
    Nunca borra un dato ya conocido y nunca baja el estado de cualificacion.
    """
    for field, value in profile.items():
        setattr(investor, field, value)

    current = investor.qualification_status or QualificationStatus.UNQUALIFIED.value
    target = current
    has_core = all(
        [
            investor.investment_goal,
            investor.budget_range,
            investor.preferred_property_market or investor.preferred_asset_type,
            investor.horizon,
        ]
    )
    if has_core:
        target = QualificationStatus.QUALIFIED.value
    if handoff or intent == "high":
        target = QualificationStatus.HIGH_INTENT.value
    if QUALIFICATION_ORDER.get(target, 0) > QUALIFICATION_ORDER.get(current, 0):
        investor.qualification_status = target


@router.post(
    "/assistant",
    response_model=AssistantResponse,
    status_code=status.HTTP_200_OK,
    summary="Conversar con Brigitte",
    description="Punto único de interacción con la asistente virtual.",
)
async def interact_with_assistant(
    request: AssistantRequest,
    db: Session = Depends(get_db),
    _rate_limit: None = Depends(enforce_ai_rate_limit),
):
    """
    1. Crea o reutiliza la conversación (y el Investor asociado).
    2. Construye el contexto: oportunidades publicadas, propiedad que mira,
       perfil ya conocido.
    3. Genera la respuesta de Brigitte.
    4. Persiste los mensajes visibles y actualiza la cualificación.
    """
    locale = request.locale

    # 1. Conversacion + Investor (flujo canonico: se crean juntos)
    if request.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == request.conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversación no encontrada")
    else:
        investor_id = None
        if request.investor_id and db.query(Investor).filter(Investor.id == request.investor_id).first():
            investor_id = request.investor_id
        else:
            new_investor = Investor(
                id=str(uuid.uuid4()),
                qualification_status=QualificationStatus.UNQUALIFIED.value,
                source="assistant",
                language=locale,
                created_at=datetime.utcnow(),
            )
            db.add(new_investor)
            investor_id = new_investor.id
        conversation = Conversation(investor_id=investor_id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    investor = (
        db.query(Investor).filter(Investor.id == conversation.investor_id).first()
        if conversation.investor_id
        else None
    )

    # 2. Contexto
    context_blocks = [
        build_context_prompt(get_published_properties(db)),
        get_property_focus(db, request.property_id),
        get_investor_profile_context(investor),
    ]
    system_prompt = SYSTEM_PROMPT.replace("{language}", language_name(locale)) + "\n\n" + "\n\n".join(
        b for b in context_blocks if b
    )

    history = get_conversation_history(db, conversation.id)

    # Persistir el mensaje del visitante antes de llamar al modelo
    db.add(Message(conversation_id=conversation.id, role="user", content=request.message))
    db.commit()

    # 3. Respuesta
    # Presupuesto mensual agotado (AI_RUNTIME_AND_COST_GUARDRAILS.md): no se
    # llama al modelo; Brigitte ofrece el contacto con el equipo.
    if budget_exhausted():
        raw = None
    else:
        raw = await call_ai_model(system_prompt, history, request.message, conversation_id=conversation.id)
    parsed = parse_model_output(raw) if raw is not None else None

    if not parsed or not parsed["reply"]:
        reply, handoff = fallback_message(locale), True
        parsed = {"profile": {}, "intent": None, "handoff": True}
    else:
        reply, handoff = parsed["reply"], parsed["handoff"]

    # 4. Persistencia: solo el texto visible, nunca el prompt ni el JSON
    db.add(Message(conversation_id=conversation.id, role="assistant", content=reply))
    if parsed.get("intent"):
        conversation.intent_score = INTENT_SCORES[parsed["intent"]]
    if investor is not None and raw is not None:
        apply_profile(investor, parsed["profile"], parsed.get("intent"), handoff)
    conversation.updated_at = datetime.utcnow()
    db.commit()

    return AssistantResponse(
        conversation_id=conversation.id,
        response=reply,
        escalate_to_human=handoff,
    )


def build_handoff_reason(
    db: Session,
    conversation: Conversation,
    investor: Investor,
    data: HandoffRequest,
) -> str:
    """Resumen para el equipo + transcripción COMPLETA (sin recortes)."""
    lines = ["Escalado desde el asistente (Brigitte)."]
    if data.locale:
        lines.append(f"Idioma: {data.locale}")
    if data.phone:
        lines.append(f"Teléfono / WhatsApp: {data.phone}")

    if data.property_id:
        prop = db.query(Property).filter(Property.id == data.property_id).first()
        if prop:
            lines.append(f"Propiedad consultada: {prop.title} ({prop.location})")

    profile = [
        f"{label}: {getattr(investor, field)}"
        for field, label in PROFILE_LABELS_ES.items()
        if getattr(investor, field, None)
    ]
    if profile:
        lines.append("Perfil: " + " · ".join(profile))

    transcript = [
        f"{'Visitante' if m['role'] == 'user' else 'Brigitte'}: {m['content']}"
        for m in get_conversation_history(db, conversation.id)
    ]
    lines.append("")
    lines.append("Conversación completa:")
    lines.extend(transcript or ["(sin mensajes)"])
    return "\n".join(lines)


@router.post(
    "/assistant/handoff",
    response_model=HandoffResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Pasar la conversación a una persona del equipo",
)
def request_handoff(
    data: HandoffRequest,
    db: Session = Depends(get_db),
    _rate_limit: None = Depends(enforce_ai_rate_limit),
) -> HandoffResponse:
    """
    El visitante deja su nombre y contacto para que le escriba una persona.
    - Crea LeadEscalation (status=open) con la conversación completa.
    - Marca la conversación como escalada y el inversor como high_intent.
    - Avisa al equipo por correo (best-effort).
    Idempotente: una conversación solo genera un escalado.
    """
    conversation = db.query(Conversation).filter(Conversation.id == data.conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversación no encontrada")
    if conversation.escalated_to_human:
        return HandoffResponse(status="already_received")

    investor = (
        db.query(Investor).filter(Investor.id == conversation.investor_id).first()
        if conversation.investor_id
        else None
    )
    if investor is None:
        investor = Investor(
            id=str(uuid.uuid4()),
            qualification_status=QualificationStatus.UNQUALIFIED.value,
            source="assistant",
            language=data.locale,
            created_at=datetime.utcnow(),
        )
        db.add(investor)
        conversation.investor_id = investor.id

    investor.name = data.name
    investor.email = data.email
    if QUALIFICATION_ORDER.get(investor.qualification_status, 0) < QUALIFICATION_ORDER["high_intent"]:
        investor.qualification_status = QualificationStatus.HIGH_INTENT.value

    reason = build_handoff_reason(db, conversation, investor, data)
    escalation = LeadEscalation(
        id=str(uuid.uuid4()),
        investor_id=investor.id,
        reason=reason,
        created_at=datetime.utcnow(),
        status=EscalationStatus.OPEN.value,
        handled_by=None,  # Solo un humano asigna
    )
    db.add(escalation)
    conversation.escalated_to_human = True
    db.commit()

    send_lead_notification(
        name=data.name,
        email=data.email,
        context=reason,
        source="Brigitte (asistente IA)",
    )

    return HandoffResponse(id=escalation.id, status="received")
