"""
Schemas Pydantic para Property (read-only).
Referencia: DATA_MODEL_AND_PERMISSIONS.md
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PropertyRead(BaseModel):
    """
    Schema de lectura de propiedad.
    Solo expone campos públicos para el asistente y frontend.
    No incluye campos sensibles ni internos.
    """
    id: str
    title: str
    location: str
    asset_type: str
    investment_range: str
    roi_estimated: Optional[str] = None
    horizon: str
    risk_notes: str

    class Config:
        from_attributes = True


class PropertyDetailRead(PropertyRead):
    """
    Schema de lectura de ficha completa (detalle publico y dossier).
    Incluye contenido enriquecido: descripcion HTML, fotos y video.
    El HTML se sanea en el frontend antes de renderizar.
    """
    description_html: Optional[str] = None
    photos: Optional[list[str]] = None
    video_url: Optional[str] = None
    dossier_slug: Optional[str] = None


class PropertyListResponse(BaseModel):
    """
    Respuesta del endpoint GET /properties.
    """
    properties: list[PropertyRead]
    count: int
