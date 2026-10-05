"""
Modelo SQLAlchemy: AiUsageLog
Referencia: AI_RUNTIME_AND_COST_GUARDRAILS.md (5. Metricas de control obligatorias)

Una fila por cada llamada al modelo (Brigitte o Agente Captador), con los
tokens y el coste en USD. Permite calcular coste por conversacion, por
lead cualificado y por funcionalidad, y aplicar el presupuesto mensual.

No guarda ningun contenido de la conversacion: solo cifras.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

from database import Base


class AiUsageLog(Base):
    __tablename__ = "ai_usage_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    feature = Column(String, nullable=False, index=True)  # "assistant" | "prospecting"
    conversation_id = Column(String, nullable=True)
    model = Column(String, nullable=True)
    prompt_tokens = Column(Integer, default=0, nullable=False)
    completion_tokens = Column(Integer, default=0, nullable=False)
    cost_usd = Column(Float, default=0.0, nullable=False)
    cost_source = Column(String, default="gateway", nullable=False)  # "gateway" | "estimate"
