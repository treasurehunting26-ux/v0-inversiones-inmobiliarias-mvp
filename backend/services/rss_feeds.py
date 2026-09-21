"""
Servicio: lectura de fuentes RSS para el Agente Captador.
Referencia: FASE2_AGENTE_CAPTADOR.md

FUENTES ACTIVAS (v1, aprobadas por el Product Owner):
- Google Alerts: el operador crea sus propias alertas en
  google.com/alerts y pega aquí la URL del feed RSS que Google genera.
- RSS público de foros especializados (A Place in the Sun,
  TheMoveChannel, Expatica), cuando publiquen feed propio.

FUERA DE ALCANCE DE ESTE MÓDULO (ver documento):
- LinkedIn, Facebook o cualquier red social: NUNCA se scrapea aquí.
  Requiere revisión legal (riesgo de infracción de Términos de Servicio
  y GDPR) antes de activarse, y viviría en un módulo separado.

Usa solo la librería estándar (urllib + xml.etree) para evitar depender
de paquetes de scraping no auditados. Cada item de un feed es texto
público ya indexado por el propio feed: no hay login ni acceso a
páginas privadas.

CLASIFICACIÓN DE FUENTES (arquitectura internacional):
No se crea ningún scraping nuevo. Cada fuente configurada en
PROSPECTING_RSS_SOURCES (nombre=url) puede, opcionalmente, clasificarse
por país, ciudad, región, idioma, mercado, tipo de fuente, prioridad,
estado legal y si está activa, vía la variable de entorno opcional
PROSPECTING_SOURCES_METADATA (JSON). Si una fuente no tiene metadata
explícita, se le asignan valores por defecto seguros (activa, tipo
"rss", estado legal "approved", mercado "unknown") y el ciclo sigue
funcionando exactamente igual que antes.
"""

import json
import logging
import os
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from dataclasses import dataclass

logger = logging.getLogger("uvicorn.error")

USER_AGENT = "BGEstateConsultingProspectingBot/1.0 (+https://bgestateconsulting.com)"

_ATOM_NS = {"atom": "http://www.w3.org/2005/Atom"}


@dataclass
class FeedItem:
    """Un item público leído de un feed RSS/Atom."""
    source: str
    title: str
    link: str
    snippet: str


@dataclass
class SourceConfig:
    """
    Clasificación de una fuente RSS configurada. No representa una
    fuente nueva ni scraping nuevo: es metadata descriptiva sobre una
    fuente ya configurada en PROSPECTING_RSS_SOURCES.
    """
    name: str
    url: str
    country: str | None = None
    city: str | None = None
    region: str | None = None
    language: str | None = None
    market: str = "unknown"
    source_type: str = "rss"  # ej. "google_alert" | "forum_rss"
    priority: int = 0
    legal_status: str = "approved"
    active: bool = True


def get_configured_sources() -> dict[str, str]:
    """
    Lee las fuentes RSS configuradas por el operador vía la variable de
    entorno PROSPECTING_RSS_SOURCES. Nunca hardcodeadas en el código.

    Formato esperado: "nombre1=url1,nombre2=url2,...".
    Si no hay ninguna configurada, retorna un dict vacío: el ciclo no
    falla, simplemente no encuentra señales.
    """
    raw = os.getenv("PROSPECTING_RSS_SOURCES", "")
    sources: dict[str, str] = {}
    for pair in raw.split(","):
        pair = pair.strip()
        if not pair or "=" not in pair:
            continue
        name, url = pair.split("=", 1)
        name, url = name.strip(), url.strip()
        if name and url:
            sources[name] = url
    return sources


def _get_sources_metadata() -> dict[str, dict]:
    """
    Lee la clasificación opcional de fuentes desde la variable de
    entorno PROSPECTING_SOURCES_METADATA (JSON, clave = nombre de la
    fuente en PROSPECTING_RSS_SOURCES). Falla de forma segura: si el
    JSON es inválido o falta, retorna un dict vacío.
    """
    raw = os.getenv("PROSPECTING_SOURCES_METADATA", "")
    if not raw.strip():
        return {}
    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else {}
    except (json.JSONDecodeError, TypeError) as exc:
        logger.warning("[prospecting] PROSPECTING_SOURCES_METADATA inválido: %s", exc)
        return {}


def get_source_configs() -> list[SourceConfig]:
    """
    Combina PROSPECTING_RSS_SOURCES con la clasificación opcional de
    PROSPECTING_SOURCES_METADATA. Cualquier fuente sin metadata explícita
    recibe valores por defecto seguros (activa, mercado "unknown").
    """
    sources = get_configured_sources()
    metadata = _get_sources_metadata()
    configs: list[SourceConfig] = []
    for name, url in sources.items():
        meta = metadata.get(name, {}) if isinstance(metadata.get(name), dict) else {}
        configs.append(
            SourceConfig(
                name=name,
                url=url,
                country=meta.get("country"),
                city=meta.get("city"),
                region=meta.get("region"),
                language=meta.get("language"),
                market=meta.get("market", "unknown"),
                source_type=meta.get("source_type", "rss"),
                priority=int(meta.get("priority", 0) or 0),
                legal_status=meta.get("legal_status", "approved"),
                active=bool(meta.get("active", True)),
            )
        )
    return configs


def fetch_feed_items(source_name: str, feed_url: str, *, max_items: int = 15) -> list[FeedItem]:
    """
    Descarga y parsea un feed RSS/Atom público. Solo lectura de contenido
    ya publicado e indexado; no requiere autenticación ni credenciales.

    Falla de forma segura: cualquier error de red o de parseo se registra
    en logs y retorna una lista vacía, sin interrumpir el resto del ciclo.
    """
    req = urllib.request.Request(feed_url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read()
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
        logger.warning(
            "[prospecting] No se pudo leer el feed %s (%s): %s", source_name, feed_url, exc
        )
        return []

    try:
        root = ET.fromstring(raw)
    except ET.ParseError as exc:
        logger.warning("[prospecting] Feed inválido en %s: %s", source_name, exc)
        return []

    items: list[FeedItem] = []

    # RSS 2.0: <rss><channel><item>...
    for item in root.findall(".//item")[:max_items]:
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        description = (item.findtext("description") or "").strip()
        if title:
            items.append(FeedItem(source=source_name, title=title, link=link, snippet=description))

    if items:
        return items

    # Atom: <feed><entry>...
    for entry in root.findall(".//atom:entry", _ATOM_NS)[:max_items]:
        title = (entry.findtext("atom:title", namespaces=_ATOM_NS) or "").strip()
        link_el = entry.find("atom:link", _ATOM_NS)
        link = link_el.get("href", "") if link_el is not None else ""
        summary = (entry.findtext("atom:summary", namespaces=_ATOM_NS) or "").strip()
        if title:
            items.append(FeedItem(source=source_name, title=title, link=link, snippet=summary))

    return items


def fetch_all_configured_feeds(*, max_items_per_source: int = 15) -> list[FeedItem]:
    """
    Recorre todas las fuentes configuradas y devuelve los items
    combinados. Omite las fuentes explícitamente marcadas como inactivas
    en PROSPECTING_SOURCES_METADATA (por defecto, todas están activas).
    """
    all_items: list[FeedItem] = []
    for config in get_source_configs():
        if not config.active:
            logger.info("[prospecting] Fuente '%s' inactiva; se omite.", config.name)
            continue
        all_items.extend(fetch_feed_items(config.name, config.url, max_items=max_items_per_source))
    return all_items
