"""
Deduplicacion de items del Agente Captador.
Referencia: AI_RUNTIME_AND_COST_GUARDRAILS.md (no procesar datos ya procesados)

Los feeds RSS devuelven en cada lectura los mismos items durante dias.
Sin deduplicar, cada noche se volvian a puntuar con IA (coste repetido) y
los que superaban el umbral generaban senales duplicadas para revisar.
"""

import hashlib
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from services.rss_feeds import FeedItem

# Parametros de seguimiento que no cambian el contenido enlazado.
_TRACKING_PREFIXES = ("utm_",)
_TRACKING_PARAMS = {"fbclid", "gclid", "mc_cid", "mc_eid", "igshid"}


def _normalize_link(link: str) -> str:
    """
    Normaliza un enlace para que la misma noticia produzca la misma huella:
    - Google Alerts envuelve los enlaces (google.com/url?...&url=<real>): se usa el real.
    - Se quitan parametros de seguimiento, fragmento y barra final.
    """
    link = (link or "").strip()
    if not link:
        return ""
    parsed = urlparse(link)
    if parsed.netloc.endswith("google.com") and parsed.path == "/url":
        target = parse_qs(parsed.query).get("url") or parse_qs(parsed.query).get("q")
        if target and target[0]:
            parsed = urlparse(target[0])

    query = [
        (k, v)
        for k, values in parse_qs(parsed.query, keep_blank_values=True).items()
        for v in values
        if not k.lower().startswith(_TRACKING_PREFIXES) and k.lower() not in _TRACKING_PARAMS
    ]
    path = parsed.path.rstrip("/") or "/"
    return urlunparse(
        (parsed.scheme.lower(), parsed.netloc.lower(), path, "", urlencode(sorted(query)), "")
    )


def item_fingerprint(item: FeedItem) -> str:
    """Hash SHA-256 estable del item (enlace normalizado, o fuente+titulo si no hay enlace)."""
    key = _normalize_link(item.link)
    if not key:
        key = f"{item.source}|{' '.join(item.title.lower().split())}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def normalized_link(item: FeedItem) -> str:
    return _normalize_link(item.link)
