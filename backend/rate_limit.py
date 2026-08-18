"""
Limitador de peticiones en memoria para el asistente de IA.
Referencia: AI_RUNTIME_AND_COST_GUARDRAILS.md

PROPOSITO:
Evitar que un visitante (o un bot) agote el presupuesto del AI Gateway
haciendo muchas llamadas seguidas, dejando el asistente sin servicio
para el resto del mes.

DISENO:
- Ventana deslizante doble: rafaga corta + tope diario, ambos por IP.
- En memoria, sin dependencias externas ni Redis.
- Se aplica ANTES de llamar al modelo y antes de persistir mensajes,
  de modo que una peticion bloqueada no genera coste ni escribe en la BD.

LIMITACION CONOCIDA:
El contador vive en el proceso. Con varias instancias cada una lleva su
propia cuenta, y un reinicio lo reinicia. Es suficiente para la fase de
validacion (una sola instancia) y el presupuesto del Gateway actua como
tope duro de respaldo. Si se escala a varias instancias, sustituir por
un contador compartido (Redis).
"""

import os
import time
import threading
from collections import deque

from fastapi import HTTPException, Request, status

# Rafaga corta: evita el martilleo inmediato.
WINDOW_SECONDS = int(os.getenv("AI_RATE_WINDOW_SECONDS", "300"))
MAX_PER_WINDOW = int(os.getenv("AI_RATE_MAX_PER_WINDOW", "8"))

# Tope diario: evita el goteo sostenido durante horas.
DAY_SECONDS = 86_400
MAX_PER_DAY = int(os.getenv("AI_RATE_MAX_PER_DAY", "40"))

# Historial de marcas de tiempo por IP.
_hits: dict[str, deque[float]] = {}
_lock = threading.Lock()

# Purga de IPs inactivas para que el diccionario no crezca sin limite.
_last_cleanup = 0.0
_CLEANUP_EVERY = 3_600


def _client_ip(request: Request) -> str:
    """
    Obtiene la IP real del visitante.

    Railway sirve detras de un proxy, por lo que request.client.host
    seria la IP del proxy y no la del visitante. X-Forwarded-For
    contiene la cadena de IPs; la primera es la del cliente original.
    """
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "desconocida"


def _purge_inactive(now: float) -> None:
    """Elimina IPs sin actividad en las ultimas 24 h. Requiere _lock."""
    global _last_cleanup
    if now - _last_cleanup < _CLEANUP_EVERY:
        return
    _last_cleanup = now
    for ip in [ip for ip, hits in _hits.items() if not hits or now - hits[-1] > DAY_SECONDS]:
        del _hits[ip]


def enforce_ai_rate_limit(request: Request) -> None:
    """
    Dependencia FastAPI. Lanza 429 si la IP supera alguno de los dos topes.

    La cabecera Retry-After indica al cliente cuantos segundos esperar,
    calculada sobre la peticion mas antigua de la ventana infringida.
    """
    ip = _client_ip(request)
    now = time.monotonic_ns() / 1_000_000_000

    with _lock:
        _purge_inactive(now)
        hits = _hits.setdefault(ip, deque())

        # Descarta lo que ya cae fuera de la ventana mas larga.
        while hits and now - hits[0] > DAY_SECONDS:
            hits.popleft()

        in_window = sum(1 for t in hits if now - t <= WINDOW_SECONDS)

        if in_window >= MAX_PER_WINDOW:
            oldest = next(t for t in hits if now - t <= WINDOW_SECONDS)
            retry_after = max(1, int(WINDOW_SECONDS - (now - oldest)) + 1)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    "Has enviado varios mensajes muy seguidos. "
                    "Espera un momento antes de continuar, o escríbenos "
                    "por el formulario de contacto si prefieres hablar con un asesor."
                ),
                headers={"Retry-After": str(retry_after)},
            )

        if len(hits) >= MAX_PER_DAY:
            retry_after = max(1, int(DAY_SECONDS - (now - hits[0])) + 1)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    "Has alcanzado el límite de mensajes por hoy. "
                    "Si quieres seguir avanzando, déjanos tus datos en el "
                    "formulario de contacto y un asesor se pondrá en contacto contigo."
                ),
                headers={"Retry-After": str(retry_after)},
            )

        hits.append(now)
