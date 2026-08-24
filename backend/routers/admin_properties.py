"""
Router FastAPI para administracion de propiedades.
Solo accesible con header X-Admin-Token valido.

Referencia: DATA_MODEL_AND_PERMISSIONS.md
- Solo humanos crean o modifican propiedades
- El status "published" requiere accion humana explicita
"""

import os
import re
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from database import get_db
from models.property import Property
from schemas.admin_property import (
    PropertyCreate,
    PropertyStatusUpdate,
    PropertyContentUpdate,
    PropertyAdminRead,
    PropertyAdminListResponse,
)


router = APIRouter(
    prefix="/admin/properties",
    tags=["admin-properties"],
)


def slugify(text: str) -> str:
    """
    Convierte un titulo en un slug legible para el dossier
    (ej. "Villa frente al mar en Marbella" -> "villa-frente-al-mar-en-marbella").
    """
    normalized = text.lower().strip()
    normalized = re.sub(r"[^a-z0-9\s-]", "", normalized)
    normalized = re.sub(r"[\s-]+", "-", normalized).strip("-")
    return normalized or "propiedad"


def generate_dossier_slug(db: Session, title: str) -> str:
    """
    Genera un slug unico para el enlace de dossier compartible.
    Anade un sufijo corto para evitar colisiones entre titulos similares.
    """
    base = slugify(title)
    for _ in range(5):
        candidate = f"{base}-{uuid.uuid4().hex[:6]}"
        exists = db.query(Property).filter(Property.dossier_slug == candidate).first()
        if not exists:
            return candidate
    return f"{base}-{uuid.uuid4().hex[:12]}"


def verify_admin_token(x_admin_token: str = Header(default="")) -> None:
    """
    Verifica que el header X-Admin-Token coincida con la env var ADMIN_TOKEN.
    Falla por bloqueo si la env no esta configurada.
    """
    expected = os.getenv("ADMIN_TOKEN", "")
    if not expected:
        raise HTTPException(
            status_code=503,
            detail="Admin no configurado en el servidor",
        )
    if x_admin_token != expected:
        raise HTTPException(status_code=401, detail="No autorizado")


@router.get("", response_model=PropertyAdminListResponse)
def admin_list_properties(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> PropertyAdminListResponse:
    """
    Devuelve todas las propiedades (incluyendo draft y archived).
    """
    items = db.query(Property).order_by(Property.created_at.desc()).all()
    return PropertyAdminListResponse(
        properties=[PropertyAdminRead.model_validate(p) for p in items],
        count=len(items),
    )


@router.post("", response_model=PropertyAdminRead, status_code=201)
def admin_create_property(
    data: PropertyCreate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> PropertyAdminRead:
    """
    Crea una propiedad nueva en estado draft.
    El cambio a published requiere PATCH explicito posterior.
    """
    new_property = Property(
        id=str(uuid.uuid4()),
        title=data.title,
        location=data.location,
        asset_type=data.asset_type,
        investment_range=data.investment_range,
        roi_estimated=data.roi_estimated,
        horizon=data.horizon,
        risk_notes=data.risk_notes,
        status="draft",
        created_by="admin",
        dossier_slug=generate_dossier_slug(db, data.title),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return PropertyAdminRead.model_validate(new_property)


@router.patch("/{property_id}/content", response_model=PropertyAdminRead)
def admin_update_content(
    property_id: str,
    data: PropertyContentUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> PropertyAdminRead:
    """
    Actualiza el contenido enriquecido de una propiedad: descripcion HTML,
    fotos y video (URLs ya subidas a Vercel Blob). Solo actualiza los
    campos enviados; el resto se mantiene igual.
    """
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")

    if data.description_html is not None:
        prop.description_html = data.description_html
    if data.photos is not None:
        prop.photos = data.photos
    if data.video_url is not None:
        prop.video_url = data.video_url
    prop.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(prop)
    return PropertyAdminRead.model_validate(prop)


@router.patch("/{property_id}/status", response_model=PropertyAdminRead)
def admin_update_status(
    property_id: str,
    data: PropertyStatusUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> PropertyAdminRead:
    """
    Cambia el status de una propiedad.
    Si pasa a published, registra approved_by="admin".
    """
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")

    prop.status = data.status
    if data.status == "published":
        prop.approved_by = "admin"
    prop.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(prop)
    return PropertyAdminRead.model_validate(prop)


@router.delete("/{property_id}", status_code=204)
def admin_delete_property(
    property_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> None:
    """
    Elimina una propiedad.
    Operacion humana, irreversible.
    """
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    db.delete(prop)
    db.commit()
    return None
