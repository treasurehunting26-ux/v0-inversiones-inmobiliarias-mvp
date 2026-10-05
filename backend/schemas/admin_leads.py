"""
Schemas Pydantic: vista humana de leads y conversaciones (panel /admin).
Referencia: MVP_TECHNICAL_BLUEPRINT.md (4.4 y 4.5, endpoints "humano"),
DATA_MODEL_AND_PERMISSIONS.md (1.3 y 1.4).

Solo los usa el operador humano autenticado con ADMIN_TOKEN. El asistente
no tiene acceso a ninguno de estos schemas ni endpoints.
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


class LeadInvestor(BaseModel):
    """Datos del inversor asociados a un escalado."""

    id: str
    name: Optional[str] = None
    email: Optional[str] = None
    source: Optional[str] = None
    qualification_status: str
    budget_range: Optional[str] = None
    investment_goal: Optional[str] = None
    horizon: Optional[str] = None
    risk_profile: Optional[str] = None
    investor_market: Optional[str] = None
    preferred_property_market: Optional[str] = None
    preferred_asset_type: Optional[str] = None

    class Config:
        from_attributes = True


class LeadRead(BaseModel):
    """Un escalado a humano con su inversor."""

    id: str
    reason: str
    status: Literal["open", "contacted", "closed"]
    handled_by: Optional[str] = None
    created_at: datetime
    investor: Optional[LeadInvestor] = None


class LeadCounts(BaseModel):
    open: int = 0
    contacted: int = 0
    closed: int = 0


class LeadListResponse(BaseModel):
    leads: list[LeadRead]
    counts: LeadCounts


class LeadStatusUpdate(BaseModel):
    """
    Cambio de estado de un escalado. Accion exclusivamente humana.

    handled_by es obligatorio: mientras el panel use un unico ADMIN_TOKEN
    compartido, es la unica forma de dejar trazabilidad de QUE persona
    gestiono el lead (ERROR_HANDLING_AND_HUMAN_OVERRIDE.md, seccion 6).
    """

    status: Literal["open", "contacted", "closed"]
    handled_by: str = Field(..., min_length=1, max_length=120)

    @field_validator("handled_by")
    @classmethod
    def strip_handled_by(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Indica quien gestiona el lead")
        return v


class ConversationSummary(BaseModel):
    """Resumen de una conversacion para el listado del panel."""

    id: str
    investor_id: Optional[str] = None
    escalated_to_human: bool
    intent_score: Optional[int] = None
    message_count: int
    first_user_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class ConversationListResponse(BaseModel):
    conversations: list[ConversationSummary]
    total: int


class ConversationMessage(BaseModel):
    role: str
    content: str
    created_at: datetime


class ConversationDetail(BaseModel):
    id: str
    investor_id: Optional[str] = None
    escalated_to_human: bool
    intent_score: Optional[int] = None
    created_at: datetime
    messages: list[ConversationMessage]
