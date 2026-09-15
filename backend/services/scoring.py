"""
Servicio: puntuación de señales de prospección vía AI Gateway.
Referencia: FASE2_AGENTE_CAPTADOR.md (criterios de cualificación de perfiles)

Usa el mismo patrón de llamada que routers/ai_assistant.py (Vercel AI
Gateway). El modelo SOLO puntúa texto ya público; nunca infiere datos
financieros no verificables (prohibición explícita del documento).
"""

import json
import logging
import os
import urllib.request
import urllib.error

logger = logging.getLogger("uvicorn.error")

SCORING_PROMPT = """Eres un analista que evalúa señales PÚBLICAS de posible interés en \
inversión inmobiliaria de lujo en la Costa del Sol (Marbella y alrededores).

Se te da el título y fragmento de un texto público (alerta de Google o post de foro). \
Evalúa SOLO con la información visible, sin inventar ni asumir datos financieros.

Criterios (un perfil cumple un criterio solo si el texto lo sugiere explícitamente):
1. Presupuesto implícito de inversión superior a 500.000 EUR
2. Intención geográfica: menciona España, Andalucía, Costa del Sol o Marbella
3. Horizonte activo: señales de búsqueda reciente (no histórica)
4. Perfil de inversor: historial de inversión inmobiliaria o financiera
5. Origen compatible: Europa (UK, DACH, Países Bajos), Oriente Medio o América Latina

Responde SOLO con JSON válido, sin texto adicional, con esta forma exacta:
{"score": <entero 0-100>, "criteria_matched": ["criterio1", "criterio2"], "justification": "<explicación breve en español>"}

Si el texto no es una señal real de interés en inversión inmobiliaria, score debe ser 0."""


def score_signal(title: str, snippet: str) -> tuple[int, str, str]:
    """
    Puntúa un item de texto público según los 5 criterios del documento.

    Retorna (score, justification, criteria_matched_csv).
    Falla de forma segura: si el modelo no responde o el JSON es
    inválido, retorna score=0 (se descarta; nunca se sobre-puntúa por
    un error técnico).
    """
    user_content = f"Título: {title}\n\nFragmento: {snippet[:1000]}"

    api_key = (
        os.environ.get("AI_GATEWAY_API_KEY")
        or os.environ.get("VERCEL_AI_GATEWAY_KEY")
        or ""
    )
    if not api_key:
        logger.warning("[prospecting] AI Gateway no configurado; se omite el scoring.")
        return 0, "", ""

    payload = json.dumps(
        {
            "model": "openai/gpt-4o-mini",
            "messages": [
                {"role": "system", "content": SCORING_PROMPT},
                {"role": "user", "content": user_content},
            ],
            "max_tokens": 300,
            "temperature": 0.2,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        "https://ai-gateway.vercel.sh/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            raw_content = data["choices"][0]["message"]["content"].strip()
            if raw_content.startswith("```"):
                raw_content = raw_content.strip("`")
                if raw_content.startswith("json"):
                    raw_content = raw_content[4:]
                raw_content = raw_content.strip()
            parsed = json.loads(raw_content)

            score = max(0, min(100, int(parsed.get("score", 0))))
            justification = str(parsed.get("justification", ""))
            criteria = parsed.get("criteria_matched", [])
            criteria_csv = (
                ", ".join(str(c) for c in criteria)
                if isinstance(criteria, list)
                else str(criteria)
            )
            return score, justification, criteria_csv
    except urllib.error.HTTPError as exc:
        try:
            detail = exc.read().decode("utf-8")[:500]
        except Exception:  # noqa: BLE001
            detail = "(sin cuerpo)"
        logger.error("[prospecting] HTTPError %s del AI Gateway: %s", exc.code, detail)
        return 0, "", ""
    except Exception as exc:  # noqa: BLE001
        logger.error(
            "[prospecting] Fallo al puntuar señal: %s: %s", exc.__class__.__name__, exc
        )
        return 0, "", ""
