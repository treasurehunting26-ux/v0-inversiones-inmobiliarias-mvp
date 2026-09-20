"""
Schemas Pydantic: Prospecting (Agente Captador)
Referencia: FASE2_AGENTE_CAPTADOR.md
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel

SignalStatusLiteral = Literal["pending_review", "approved", "discarded"]


class ProspectingSignalRead(BaseModel):
    """Lectura de una señal detectada por el Agente Captador."""
    id: str
    source: str
    source_url: Optional[str] = None
    title: str
    snippet: str
    score: int
    justification: Optional[str] = None
    criteria_matched: Optional[str] = None
    status: SignalStatusLiteral
    investor_id: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

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
