"""
Schemas Pydantic: ProspectingSource (Source Registry)
Referencia: FASE2_AGENTE_CAPTADOR.md
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel

SourceTypeLiteral = Literal["rss", "atom", "official_api", "public_feed", "other_approved"]


class ProspectingSourceCreate(BaseModel):
    """
    Alta de una fuente en el registry. investor_market y property_market
    son campos independientes: no representan lo mismo y ninguno se
    infiere a partir del otro.
    """

    name: str
    url: str
    source_type: SourceTypeLiteral = "rss"
    country: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    language: Optional[str] = None
    investor_market: Optional[str] = None
    property_market: Optional[str] = None
    priority: int = 0
    legal_status: str = "approved"
    active: bool = True


class ProspectingSourceUpdate(BaseModel):
    """Actualización parcial: solo se modifican los campos enviados."""

    name: Optional[str] = None
    url: Optional[str] = None
    source_type: Optional[SourceTypeLiteral] = None
    country: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    language: Optional[str] = None
    investor_market: Optional[str] = None
    property_market: Optional[str] = None
    priority: Optional[int] = None
    legal_status: Optional[str] = None
    active: Optional[bool] = None


class ProspectingSourceRead(BaseModel):
    id: str
    name: str
    url: str
    source_type: str
    country: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    language: Optional[str] = None
    investor_market: Optional[str] = None
    property_market: Optional[str] = None
    priority: int
    legal_status: str
    active: bool
    last_checked_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProspectingSourceListResponse(BaseModel):
    sources: list[ProspectingSourceRead]
    count: int


class ProspectingSourceMigrationResult(BaseModel):
    """Resultado de migrar las fuentes definidas por variables de entorno al registry."""

    migrated: list[str]
    skipped_existing: list[str]
