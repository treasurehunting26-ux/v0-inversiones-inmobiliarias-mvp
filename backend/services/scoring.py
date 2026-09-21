"""
Servicio: puntuación y extracción de perfil de señales de prospección
vía AI Gateway.
Referencia: FASE2_AGENTE_CAPTADOR.md (criterios de cualificación de perfiles)

Usa el mismo patrón de llamada que routers/ai_assistant.py (Vercel AI
Gateway). El modelo SOLO puntúa texto ya público; nunca infiere datos
financieros no verificables (prohibición explícita del documento).

ARQUITECTURA INTERNACIONAL (no exclusiva de Marbella):
La plataforma opera en múltiples mercados. El modelo debe distinguir
SIEMPRE dos conceptos independientes:

1. MERCADO DEL INVERSOR (investor_market/investor_country/investor_city):
   dónde está, reside u opera el potencial inversor.
2. MERCADO DEL ACTIVO PREFERIDO (preferred_property_market): el mercado
   inmobiliario que el texto sugiere que le interesa al inversor.

Un inversor detectado en Dubai puede buscar Marbella, Madrid, Dubai u
otro mercado. NUNCA se debe asumir que investor_market == property
market de interés. No inventar ningún campo que el texto no sugiera
explícitamente: se deja en None/null.
"""

import json
import logging
import os
import urllib.request
import urllib.error
from dataclasses import dataclass, field

logger = logging.getLogger("uvicorn.error")

SCORING_PROMPT = """Eres un analista que evalúa señales PÚBLICAS de posible interés en \
inversión inmobiliaria internacional (la plataforma opera en múltiples mercados: \
Marbella/Costa del Sol, Madrid, otras zonas de España, Dubai/UAE y otros mercados \
internacionales que se incorporen).

Se te da el título y fragmento de un texto público (alerta de Google o post de foro), \
y opcionalmente la lista de mercados de activos actualmente disponibles en la \
plataforma. Evalúa SOLO con la información visible, sin inventar ni asumir datos \
financieros ni geográficos que el texto no sugiera explícitamente.

DEBES DISTINGUIR SIEMPRE DOS CONCEPTOS INDEPENDIENTES, NUNCA IGUALARLOS:
1. MERCADO DEL INVERSOR: dónde está, reside u opera el potencial inversor (de dónde
   parece escribir o a qué comunidad/foro geográfico pertenece la señal).
2. MERCADO DEL ACTIVO PREFERIDO: el mercado inmobiliario que el texto sugiere que le
   interesa (puede ser distinto, igual, o no mencionarse en absoluto).
   Ejemplo válido: un inversor ubicado en Dubai que busca una propiedad en Marbella.
   Ejemplo válido: un inversor ubicado en Caracas que busca una propiedad en Madrid.
   NO asumas que el inversor busca invertir en el lugar donde fue detectado.

Criterios de cualificación (un criterio se cumple solo si el texto lo sugiere
explícitamente):
1. Presupuesto o capacidad de inversión implícita relevante (orden de magnitud alto)
2. Intención geográfica de inversión explícita hacia alguno de los mercados de activo
   soportados por la plataforma
3. Horizonte activo: señales de búsqueda reciente (no histórica)
4. Perfil de inversor: historial de inversión inmobiliaria o financiera
5. Origen o idioma compatible con los mercados de inversores soportados (Dubai/UAE,
   Caracas/Venezuela, India, Europa, Latinoamérica, u otro origen internacional)

Responde SOLO con JSON válido, sin texto adicional, con esta forma exacta:
{
  "score": <entero 0-100>,
  "confidence": <entero 0-100, confianza en el perfil extraído, no en el score>,
  "criteria_matched": ["criterio1", "criterio2"],
  "justification": "<explicación breve en español>",
  "investor_market": <string o null, ej. "dubai_uae" | "caracas_venezuela" | "india" | "europe" | "latam" | "international_other">,
  "investor_country": <string o null>,
  "investor_city": <string o null>,
  "language": <string o null, idioma del texto original>,
  "estimated_investment_capacity": <string o null, solo si el texto lo sugiere explícitamente>,
  "preferred_property_market": <string o null, ej. "Marbella", "Madrid", "Dubai" — SOLO si el texto lo menciona>,
  "preferred_asset_type": <string o null>
}

Si el texto no es una señal real de interés en inversión inmobiliaria, score debe ser 0 \
y todos los campos de perfil deben ser null."""


@dataclass
class SignalScoreResult:
    """Resultado de puntuar y extraer el perfil de una señal."""
    score: int = 0
    confidence: int = 0
    justification: str = ""
    criteria_matched: str = ""
    investor_market: str | None = None
    investor_country: str | None = None
    investor_city: str | None = None
    language: str | None = None
    estimated_investment_capacity: str | None = None
    preferred_property_market: str | None = None
    preferred_asset_type: str | None = None


def _build_user_content(title: str, snippet: str, available_property_markets: list[str]) -> str:
    content = f"Título: {title}\n\nFragmento: {snippet[:1000]}"
    if available_property_markets:
        markets_list = ", ".join(sorted(set(available_property_markets)))
        content += f"\n\nMercados de activos actualmente disponibles en la plataforma: {markets_list}"
    return content


def score_signal(
    title: str,
    snippet: str,
    *,
    available_property_markets: list[str] | None = None,
) -> SignalScoreResult:
    """
    Puntúa un item de texto público y extrae, cuando el texto lo sugiere
    explícitamente, el perfil del inversor (mercado del inversor) por
    separado del mercado de activo que parece interesarle.

    `available_property_markets` es opcional: lista de mercados de
    activos ya publicados en la plataforma (ej. ubicaciones de
    Property.status == "published"), usada solo como contexto para que
    el modelo evalúe compatibilidad, nunca para forzar una coincidencia.

    Falla de forma segura: si el modelo no responde o el JSON es
    inválido, retorna score=0 (se descarta; nunca se sobre-puntúa por
    un error técnico), sin ningún campo de perfil inventado.
    """
    user_content = _build_user_content(title, snippet, available_property_markets or [])

    api_key = (
        os.environ.get("AI_GATEWAY_API_KEY")
        or os.environ.get("VERCEL_AI_GATEWAY_KEY")
        or ""
    )
    if not api_key:
        logger.warning("[prospecting] AI Gateway no configurado; se omite el scoring.")
        return SignalScoreResult()

    payload = json.dumps(
        {
            "model": "openai/gpt-4o-mini",
            "messages": [
                {"role": "system", "content": SCORING_PROMPT},
                {"role": "user", "content": user_content},
            ],
            "max_tokens": 400,
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
            confidence = max(0, min(100, int(parsed.get("confidence", 0) or 0)))
            justification = str(parsed.get("justification", ""))
            criteria = parsed.get("criteria_matched", [])
            criteria_csv = (
                ", ".join(str(c) for c in criteria)
                if isinstance(criteria, list)
                else str(criteria)
            )

            def _clean(value) -> str | None:
                if value is None:
                    return None
                value = str(value).strip()
                return value if value and value.lower() != "null" else None

            return SignalScoreResult(
                score=score,
                confidence=confidence,
                justification=justification,
                criteria_matched=criteria_csv,
                investor_market=_clean(parsed.get("investor_market")),
                investor_country=_clean(parsed.get("investor_country")),
                investor_city=_clean(parsed.get("investor_city")),
                language=_clean(parsed.get("language")),
                estimated_investment_capacity=_clean(parsed.get("estimated_investment_capacity")),
                preferred_property_market=_clean(parsed.get("preferred_property_market")),
                preferred_asset_type=_clean(parsed.get("preferred_asset_type")),
            )
    except urllib.error.HTTPError as exc:
        try:
            detail = exc.read().decode("utf-8")[:500]
        except Exception:  # noqa: BLE001
            detail = "(sin cuerpo)"
        logger.error("[prospecting] HTTPError %s del AI Gateway: %s", exc.code, detail)
        return SignalScoreResult()
    except Exception as exc:  # noqa: BLE001
        logger.error(
            "[prospecting] Fallo al puntuar señal: %s: %s", exc.__class__.__name__, exc
        )
        return SignalScoreResult()
