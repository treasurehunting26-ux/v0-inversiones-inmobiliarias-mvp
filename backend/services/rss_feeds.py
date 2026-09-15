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
"""

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
    """Recorre todas las fuentes configuradas y devuelve los items combinados."""
    all_items: list[FeedItem] = []
    for name, url in get_configured_sources().items():
        all_items.extend(fetch_feed_items(name, url, max_items=max_items_per_source))
    return all_items
