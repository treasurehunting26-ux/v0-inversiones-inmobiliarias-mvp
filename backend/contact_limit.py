"""
Limite anti-spam del formulario de contacto (POST /contact).
Referencia: MVP_TECHNICAL_BLUEPRINT.md (6. rate limiting obligatorio)

Cada envio crea un Investor + LeadEscalation y manda un correo al equipo.
Sin limite, un bot puede llenar la base de datos y la bandeja de entrada.

Mismo diseño que rate_limit.py (en memoria, por IP, ventana doble), con
contador propio para no consumir el cupo del asistente.
"""

import os
import threading
import time
from collections import deque

from fastapi import HTTPException, Request, status

WINDOW_SECONDS = int(os.getenv("CONTACT_RATE_WINDOW_SECONDS", "600"))
MAX_PER_WINDOW = int(os.getenv("CONTACT_RATE_MAX_PER_WINDOW", "3"))
DAY_SECONDS = 86_400
MAX_PER_DAY = int(os.getenv("CONTACT_RATE_MAX_PER_DAY", "10"))

_hits: dict[str, deque[float]] = {}
_lock = threading.Lock()

_MESSAGES = {
    "es": "Ya hemos recibido varias solicitudes desde tu conexión. Si necesitas algo más, inténtalo de nuevo más tarde.",
    "en": "We've already received several requests from your connection. If you need anything else, please try again later.",
}


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "desconocida"


def _locale(request: Request) -> str:
    raw = request.headers.get("x-locale") or request.headers.get("accept-language") or "es"
    return raw.strip().lower()[:2]


def enforce_contact_rate_limit(request: Request) -> None:
    """Dependencia FastAPI: 429 si la IP supera el limite. No escribe nada si bloquea."""
    ip = _client_ip(request)
    now = time.monotonic()

    with _lock:
        hits = _hits.setdefault(ip, deque())
        while hits and now - hits[0] > DAY_SECONDS:
            hits.popleft()
        in_window = sum(1 for t in hits if now - t <= WINDOW_SECONDS)

        if in_window >= MAX_PER_WINDOW or len(hits) >= MAX_PER_DAY:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=_MESSAGES.get(_locale(request), _MESSAGES["en"]),
                headers={"Retry-After": str(WINDOW_SECONDS)},
            )

        hits.append(now)
        # Limpieza ocasional de IPs inactivas
        if len(_hits) > 5_000:
            for key in [k for k, v in _hits.items() if not v or now - v[-1] > DAY_SECONDS]:
                del _hits[key]
