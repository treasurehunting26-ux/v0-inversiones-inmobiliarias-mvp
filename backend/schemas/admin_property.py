"""
Schemas Pydantic para administracion de propiedades.
Solo accesibles desde el panel admin con autenticacion.
Referencia: DATA_MODEL_AND_PERMISSIONS.md
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


PropertyStatus = Literal["draft", "published", "archived"]


class PropertyCreate(BaseModel):
    """
    Schema de creacion de propiedad (admin).
    """
    title: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)
    asset_type: str = Field(..., min_length=1)
    investment_range: str = Field(..., min_length=1)
    horizon: str = Field(..., min_length=1)
    risk_notes: str = Field(..., min_length=1)
    roi_estimated: Optional[str] = None


class PropertyStatusUpdate(BaseModel):
    """
    Cambio de status (publicar / archivar / volver a draft).
    """
    status: PropertyStatus


class PropertyAdminRead(BaseModel):
    """
    Lectura admin: incluye campos internos (status, created_by, timestamps).
    """
    id: str
    title: str
    location: str
    asset_type: str
    investment_range: str
    roi_estimated: Optional[str] = None
    horizon: str
    risk_notes: str
    status: str
    created_by: str
    approved_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PropertyAdminListResponse(BaseModel):
    properties: list[PropertyAdminRead]
    count: int
