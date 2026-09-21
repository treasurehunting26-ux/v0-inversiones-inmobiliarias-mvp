"""
Schemas Pydantic: Prospecting (Agente Captador)
Referencia: FASE2_AGENTE_CAPTADOR.md
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel

SignalStatusLiteral = Literal["pending_review", "approved", "discarded"]


class ProspectingSignalRead(BaseModel):
    """Lectura de una señal detectada por el Agente Captador.

    MERCADO DEL INVERSOR (investor_market/investor_country/investor_city)
    y MERCADO DEL ACTIVO PREFERIDO (preferred_property_market) son campos
    independientes: nunca representan lo mismo. El primero indica dónde
    está el inversor; el segundo, qué mercado inmobiliario le interesa.
    """
    id: str
    source: str
    source_url: Optional[str] = None
    title: str
    snippet: str
    score: int
    confidence: Optional[int] = None
    justification: Optional[str] = None
    criteria_matched: Optional[str] = None
    status: SignalStatusLiteral
    investor_id: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    # Mercado del INVERSOR: dónde está, no dónde quiere invertir.
    investor_market: Optional[str] = None
    investor_country: Optional[str] = None
    investor_city: Optional[str] = None
    language: Optional[str] = None
    estimated_investment_capacity: Optional[str] = None

    # Mercado del ACTIVO preferido: dónde quiere invertir.
    preferred_property_market: Optional[str] = None
    preferred_asset_type: Optional[str] = None

    class Config:
        from_attributes = True


class ProspectingSignalListResponse(BaseModel):
    signals: list[ProspectingSignalRead]
    count: int


class ProspectingRunResult(BaseModel):
    """Resultado de un ciclo de captación disparado por el cron."""
    run_id: str
    sources_checked: list[str]
    signals_found: int
    signals_qualified: int
    status: str


class ProspectingRunLogRead(BaseModel):
    id: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    sources_checked: str
    signals_found: int
    signals_qualified: int
    status: str
    error_detail: Optional[str] = None

    class Config:
        from_attributes = True


class ProspectingRunLogListResponse(BaseModel):
    runs: list[ProspectingRunLogRead]


FollowUpStatusLiteral = Literal["pending", "done"]


class ProspectingFollowUpRead(BaseModel):
    """
    Tarea interna de seguimiento humano, generada al aprobar una señal.
    No representa contacto real: solo indica que un Investor cualificado
    por el Agente Captador está a la espera de que un humano le dé
    seguimiento.
    """
    id: str
    investor_id: str
    signal_id: str
    reason: str
    status: FollowUpStatusLiteral
    created_at: datetime
    completed_at: Optional[datetime] = None
    completed_by: Optional[str] = None

    class Config:
        from_attributes = True


class ProspectingFollowUpListResponse(BaseModel):
    followups: list[ProspectingFollowUpRead]
    count: int
