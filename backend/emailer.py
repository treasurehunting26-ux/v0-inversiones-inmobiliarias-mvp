"""
Modulo de notificaciones por correo (Zoho Mail SMTP).
Referencia: solicitado para avisar al equipo de B&G Consulting cuando
llega un nuevo contacto (formulario o escalado desde el asistente de IA).

Variables de entorno requeridas (configurar en Railway):
- ZOHO_EMAIL_ADDRESS: la casilla que envia y recibe los avisos
  (ej. contact@bgestateconsulting.com)
- ZOHO_EMAIL_APP_PASSWORD: contrasena de aplicacion generada en Zoho
  (Zoho Mail > Configuracion > Seguridad > Contrasenas de aplicacion),
  NO la contrasena normal de la cuenta.

Fallo seguro: si el envio de correo falla (credenciales ausentes, red,
etc.) se registra el error en logs pero NUNCA se interrumpe el flujo
principal (guardar el contacto/escalado en base de datos siempre tiene
prioridad sobre el envio del aviso).
"""

import logging
import os
import smtplib
from email.mime.text import MIMEText
from email.utils import formatdate

logger = logging.getLogger("uvicorn.error")

ZOHO_SMTP_HOST = "smtp.zoho.com"
ZOHO_SMTP_PORT = 465


def send_lead_notification(*, name: str, email: str, context: str, source: str) -> None:
    """
    Envia un correo de aviso a la casilla configurada en ZOHO_EMAIL_ADDRESS
    cuando llega un nuevo contacto (formulario web o escalado del asistente).

    No lanza excepciones: cualquier fallo queda registrado en logs y
    la funcion retorna silenciosamente para no romper el request HTTP
    que la invoca.
    """
    sender = os.environ.get("ZOHO_EMAIL_ADDRESS")
    password = os.environ.get("ZOHO_EMAIL_APP_PASSWORD")

    if not sender or not password:
        logger.warning(
            "[emailer] ZOHO_EMAIL_ADDRESS / ZOHO_EMAIL_APP_PASSWORD no configuradas; "
            "se omite el envio de la notificacion de contacto."
        )
        return

    subject = f"Nuevo contacto ({source}) — {name}"
    body = (
        f"Se ha registrado un nuevo contacto en bgestateconsulting.com.\n\n"
        f"Origen: {source}\n"
        f"Nombre: {name}\n"
        f"Email: {email}\n\n"
        f"Mensaje / contexto:\n{context}\n"
    )

    message = MIMEText(body, "plain", "utf-8")
    message["Subject"] = subject
    message["From"] = sender
    message["To"] = sender
    message["Reply-To"] = email
    message["Date"] = formatdate(localtime=True)

    try:
        with smtplib.SMTP_SSL(ZOHO_SMTP_HOST, ZOHO_SMTP_PORT, timeout=15) as server:
            server.login(sender, password)
            server.sendmail(sender, [sender], message.as_string())
        logger.info("[emailer] Notificacion de contacto enviada (%s)", source)
    except Exception as exc:  # noqa: BLE001
        logger.error(
            "[emailer] Fallo al enviar notificacion de contacto: %s: %s",
            exc.__class__.__name__,
            exc,
        )
