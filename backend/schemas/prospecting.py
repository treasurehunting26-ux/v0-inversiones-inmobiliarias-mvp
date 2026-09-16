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
