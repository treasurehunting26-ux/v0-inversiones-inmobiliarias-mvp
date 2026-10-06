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

    Flujo principal: se importa un dossier HTML completo (description_html)
    y los datos se autocompletan desde el y los revisa un humano. Horizonte
    y notas de riesgo pueden quedar vacios si el dossier no los menciona.
    """
    title: str = Field(..., min_length=1, max_length=300)
    location: str = Field(..., min_length=1, max_length=300)
    asset_type: str = Field(..., min_length=1, max_length=120)
    investment_range: str = Field(..., min_length=1, max_length=200)
    horizon: str = Field(default="", max_length=200)
    risk_notes: str = Field(default="", max_length=4000)
    description_html: Optional[str] = None
    description_html_en: Optional[str] = None
    photos: Optional[list[str]] = None


class PropertyFieldsUpdate(BaseModel):
    """Correccion de los datos de una propiedad. Solo se actualiza lo enviado."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=300)
    location: Optional[str] = Field(default=None, min_length=1, max_length=300)
    asset_type: Optional[str] = Field(default=None, min_length=1, max_length=120)
    investment_range: Optional[str] = Field(default=None, min_length=1, max_length=200)
    horizon: Optional[str] = Field(default=None, max_length=200)
    risk_notes: Optional[str] = Field(default=None, max_length=4000)


class ExtractFieldsRequest(BaseModel):
    """Texto visible de un dossier para proponer los datos de la ficha."""
    text: str = Field(..., min_length=1, max_length=60000)
    title_hint: Optional[str] = Field(default=None, max_length=300)


class ExtractFieldsResponse(BaseModel):
    """Propuesta de datos (el humano la revisa antes de guardar). null = no aparece en el dossier."""
    title: Optional[str] = None
    location: Optional[str] = None
    asset_type: Optional[str] = None
    investment_range: Optional[str] = None
    horizon: Optional[str] = None
    risk_notes: Optional[str] = None


class PropertyStatusUpdate(BaseModel):
    """
    Cambio de status (publicar / archivar / volver a draft).
    """
    status: PropertyStatus


class PropertyContentUpdate(BaseModel):
    """
    Actualizacion de contenido enriquecido (ficha y dossier privado).
    Todos los campos son opcionales: se actualiza solo lo enviado.
    El HTML se guarda tal cual; se sanea en el frontend antes de mostrarse.
    """
    description_html: Optional[str] = None
    # "" = quitar la version en ingles
    description_html_en: Optional[str] = None
    photos: Optional[list[str]] = None
    video_url: Optional[str] = None
    dossier_html_url: Optional[str] = None


class PropertyAdminRead(BaseModel):
    """
    Lectura admin para el listado: incluye campos internos, pero NO el HTML
    del dossier (puede pesar cientos de KB por propiedad). Para el HTML,
    GET /admin/properties/{id}.
    """
    id: str
    title: str
    location: str
    asset_type: str
    investment_range: str
    horizon: str
    risk_notes: str
    status: str
    created_by: str
    approved_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    photos: Optional[list[str]] = None
    video_url: Optional[str] = None
    dossier_slug: Optional[str] = None
    dossier_html_url: Optional[str] = None
    has_dossier: bool = False
    has_dossier_en: bool = False
    dossier_en_kb: int = 0
    dossier_kb: int = 0

    class Config:
        from_attributes = True


class PropertyAdminDetail(PropertyAdminRead):
    """Lectura admin de una propiedad con el HTML del dossier."""
    description_html: Optional[str] = None
    description_html_en: Optional[str] = None


class FetchDossierResponse(BaseModel):
    """HTML de un dossier subido antes a Vercel Blob, para reimportarlo."""
    html: str


class PropertyAdminListResponse(BaseModel):
    properties: list[PropertyAdminRead]
    count: int
