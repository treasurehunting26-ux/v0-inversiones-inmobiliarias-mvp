"""
Utilidades del dossier HTML de una propiedad.
Referencia: DATA_MODEL_AND_PERMISSIONS.md (solo humanos crean propiedades),
ASSISTANT_MASTER_PROMPT.md (solo datos existentes en base de datos).

El dossier (un documento HTML completo diseñado fuera del panel) ES la
ficha de la propiedad en la web. Se guarda en Property.description_html.
"""

import json
import logging
import os
import re
import urllib.error
import urllib.request
from html.parser import HTMLParser
from typing import Optional
from urllib.parse import urlparse

from fastapi import HTTPException

from schemas.admin_property import ExtractFieldsResponse
from services.ai_usage import record_usage

logger = logging.getLogger("uvicorn.error")

MODEL = "openai/gpt-4o-mini"
MAX_BLOB_BYTES = 60 * 1024 * 1024
FIELD_LIMITS = {
    "title": 300,
    "location": 300,
    "asset_type": 120,
    "investment_range": 200,
    "horizon": 200,
    "risk_notes": 4000,
}


def is_full_html_document(html: Optional[str]) -> bool:
    return bool(html) and bool(re.search(r"<html[\s>]|<!doctype html", html[:5000], re.IGNORECASE))


class _TextExtractor(HTMLParser):
    """Texto visible: ignora <script>, <style>, <noscript>, <template>, <head>."""

    SKIP = {"script", "style", "noscript", "template", "head", "svg"}
    BLOCK = {"p", "div", "section", "article", "li", "br", "h1", "h2", "h3", "h4", "h5", "h6", "tr", "dt", "dd", "figcaption", "header", "footer"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self._skip_depth += 1
        elif tag in self.BLOCK:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.SKIP and self._skip_depth:
            self._skip_depth -= 1
        elif tag in self.BLOCK:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self._skip_depth:
            self.parts.append(data)


def html_to_text(html: Optional[str], limit: Optional[int] = None) -> str:
    """Texto plano del dossier (para Brigitte y la extraccion de datos)."""
    if not html:
        return ""
    parser = _TextExtractor()
    try:
        parser.feed(html)
        parser.close()
    except Exception:  # noqa: BLE001
        return ""
    text = "".join(parser.parts)
    lines = [" ".join(line.split()) for line in text.splitlines()]
    text = "\n".join(line for line in lines if line)
    return text[:limit] if limit else text


EXTRACT_PROMPT = """Eres un asistente que rellena la ficha de una propiedad a partir del texto de su dossier comercial.
Devuelve SOLO un objeto JSON con estas claves:
{"title": ..., "location": ..., "asset_type": ..., "investment_range": ..., "horizon": ..., "risk_notes": ...}

Reglas estrictas:
- Usa SOLO lo que el texto dice explícitamente. Si un dato no aparece, pon null. Nunca inventes ni estimes.
- title: el nombre de la propiedad tal como aparece (ej. "Villa Los Monteros").
- location: zona y ciudad/región tal como aparecen (ej. "Los Monteros, Marbella Este").
- asset_type: tipo de activo en una o dos palabras (ej. "Villa", "Ático", "Edificio", "Suelo").
- investment_range: el precio o rango de precio tal como aparece, con su moneda (ej. "3.450.000 €").
- horizon: plazo de inversión o de entrega solo si el texto lo menciona (ej. "Entrega 2027"); si no, null.
- risk_notes: consideraciones o riesgos que el texto mencione (cargas, licencias, obras, ocupación...), en una o dos frases; si no menciona ninguno, null.
- Escribe en el mismo idioma que el dossier."""


def extract_fields_with_ai(text: str, title_hint: Optional[str] = None) -> ExtractFieldsResponse:
    """
    Propone los datos de la ficha desde el texto del dossier. Falla de
    forma segura: si la IA no responde, devuelve todo vacio (el humano
    rellena) en lugar de bloquear la importacion.
    """
    api_key = os.environ.get("AI_GATEWAY_API_KEY") or os.environ.get("VERCEL_AI_GATEWAY_KEY") or ""
    fallback = ExtractFieldsResponse(title=(title_hint or "").strip()[:300] or None)
    if not api_key:
        logger.warning("[dossier] AI Gateway no configurado; se omite la extraccion de datos.")
        return fallback

    content = text[:20000]
    if title_hint:
        content = f"Título del documento: {title_hint}\n\n{content}"

    payload = json.dumps(
        {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": EXTRACT_PROMPT},
                {"role": "user", "content": content},
            ],
            "max_tokens": 500,
            "temperature": 0,
            "response_format": {"type": "json_object"},
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://ai-gateway.vercel.sh/v1/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        record_usage(data, feature="admin", model=MODEL)
        parsed = json.loads(data["choices"][0]["message"]["content"])
    except Exception as exc:  # noqa: BLE001
        logger.error("[dossier] Fallo al extraer datos: %s: %s", exc.__class__.__name__, exc)
        return fallback

    result = {}
    for field, limit in FIELD_LIMITS.items():
        value = parsed.get(field) if isinstance(parsed, dict) else None
        if isinstance(value, str) and value.strip() and value.strip().lower() not in ("null", "none", "n/a"):
            result[field] = value.strip()[:limit]
    if not result.get("title") and fallback.title:
        result["title"] = fallback.title
    return ExtractFieldsResponse(**result)


def fetch_blob_html(url: str) -> str:
    """
    Descarga un dossier HTML subido a Vercel Blob. Solo se permite el
    dominio publico de Blob (evita que el endpoint sirva para pedir
    cualquier URL desde el servidor).
    """
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.netloc.endswith(".public.blob.vercel-storage.com"):
        raise HTTPException(status_code=400, detail="Solo se pueden recuperar dossiers guardados en Vercel Blob")

    req = urllib.request.Request(url, headers={"User-Agent": "BG-Consulting-Admin/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read(MAX_BLOB_BYTES + 1)
    except urllib.error.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"El archivo no está disponible (error {exc.code})") from exc
    except Exception as exc:  # noqa: BLE001
        logger.error("[dossier] No se pudo descargar %s: %s", url, exc)
        raise HTTPException(status_code=502, detail="No se pudo descargar el dossier") from exc

    if len(raw) > MAX_BLOB_BYTES:
        raise HTTPException(status_code=413, detail="El dossier supera 60 MB")
    for encoding in ("utf-8", "latin-1"):
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue
    return raw.decode("utf-8", errors="replace")


def dossier_html_for(prop, locale: str | None) -> str:
    """HTML del dossier en el idioma pedido; si no hay version en ese idioma, el espanol."""
    if (locale or "").lower().startswith("en") and getattr(prop, "description_html_en", None):
        return prop.description_html_en
    return prop.description_html or ""
