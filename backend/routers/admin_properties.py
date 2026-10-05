"""
Router FastAPI para administracion de propiedades.
Solo accesible con header X-Admin-Token valido.

Referencia: DATA_MODEL_AND_PERMISSIONS.md
- Solo humanos crean o modifican propiedades
- El status "published" requiere accion humana explicita
"""

import hmac
import os
import re
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from models.property import Property
from schemas.admin_property import (
    PropertyCreate,
    PropertyStatusUpdate,
    PropertyContentUpdate,
    PropertyFieldsUpdate,
    PropertyAdminRead,
    PropertyAdminDetail,
    PropertyAdminListResponse,
    ExtractFieldsRequest,
    ExtractFieldsResponse,
    FetchDossierResponse,
)
from services.dossier import (
    extract_fields_with_ai,
    fetch_blob_html,
    is_full_html_document,
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


def generate_dossier_slug(
    db: Session,
    title: str,
    exclude_id: Optional[str] = None,
) -> str:
    """
    Genera el slug mas limpio posible para el enlace de dossier compartible.

    Usa el titulo tal cual ("villa-los-monteros"). Solo si ese slug ya esta
    ocupado por OTRA propiedad anade un sufijo numerico legible
    ("villa-los-monteros-2"), en vez de un codigo aleatorio.

    exclude_id permite recalcular el slug de una propiedad existente sin que
    choque consigo misma.
    """
    base = slugify(title)
    for candidate in [base] + [f"{base}-{n}" for n in range(2, 51)]:
        query = db.query(Property).filter(Property.dossier_slug == candidate)
        if exclude_id is not None:
            query = query.filter(Property.id != exclude_id)
        if not query.first():
            return candidate
    # Salvaguarda muy improbable: 50 propiedades con el mismo titulo
    return f"{base}-{uuid.uuid4().hex[:6]}"


def to_admin_read(prop: Property, detail: bool = False) -> PropertyAdminRead:
    """Lectura admin. El listado no lleva el HTML del dossier (solo su tamano)."""
    html = prop.description_html or ""
    model = PropertyAdminDetail if detail else PropertyAdminRead
    data = model.model_validate(prop)
    data.has_dossier = bool(prop.dossier_html_url) or is_full_html_document(html)
    data.dossier_kb = round(len(html.encode("utf-8")) / 1024)
    return data


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
    # Comparacion en tiempo constante (evita ataques por tiempo de respuesta)
    if not hmac.compare_digest(x_admin_token.encode(), expected.encode()):
        raise HTTPException(status_code=401, detail="No autorizado")


@router.post("/migrate-content-fields")
def admin_migrate_content_fields(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> dict:
    """
    Migracion puntual: anade a la tabla properties las columnas de contenido
    enriquecido (description_html, photos, video_url, dossier_slug) y genera
    un dossier_slug para las propiedades que aun no lo tengan.

    Idempotente: "ADD COLUMN IF NOT EXISTS" no falla si ya existe. Pensada
    para ejecutarse una sola vez desde el admin tras desplegar este cambio.
    """
    statements = [
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS description_html TEXT",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS photos JSON",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_url VARCHAR",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS dossier_slug VARCHAR",
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_properties_dossier_slug "
        "ON properties (dossier_slug)",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS dossier_html_url VARCHAR",
    ]
    for stmt in statements:
        db.execute(text(stmt))
    db.commit()

    # Genera slug para filas existentes que no lo tengan (creadas antes de esta migracion)
    rows_without_slug = db.query(Property).filter(Property.dossier_slug.is_(None)).all()
    assigned = 0
    for prop in rows_without_slug:
        prop.dossier_slug = generate_dossier_slug(db, prop.title, exclude_id=prop.id)
        assigned += 1
    db.commit()

    # Acorta los slugs antiguos que llevan sufijo aleatorio
    # ("villa-los-monteros-94f694" -> "villa-los-monteros") cuando el slug
    # limpio esta libre. Idempotente: si ya esta limpio no cambia nada.
    cleaned = 0
    existing = db.query(Property).filter(Property.dossier_slug.isnot(None)).all()
    for prop in existing:
        preferred = generate_dossier_slug(db, prop.title, exclude_id=prop.id)
        if preferred != prop.dossier_slug:
            prop.dossier_slug = preferred
            cleaned += 1
    db.commit()

    return {
        "status": "ok",
        "columns_ensured": [
            "description_html",
            "photos",
            "video_url",
            "dossier_slug",
        ],
        "slugs_assigned": assigned,
        "slugs_cleaned": cleaned,
    }


@router.post("/migrate-drop-roi-estimated")
def admin_migrate_drop_roi_estimated(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> dict:
    """
    Migracion puntual: elimina la columna roi_estimated de la tabla properties.

    Se retira porque estimar un ROI en una ficha de propiedad es una promesa
    de rentabilidad poco etica y no verificable; ahora el analisis de riesgo
    vive solo en risk_notes, redactado por un humano.

    Idempotente: "DROP COLUMN IF EXISTS" no falla si ya no existe.
    """
    db.execute(text("ALTER TABLE properties DROP COLUMN IF EXISTS roi_estimated"))
    db.commit()
    return {"status": "ok"}


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
        properties=[to_admin_read(p) for p in items],
        count=len(items),
    )


@router.post("/extract-fields", response_model=ExtractFieldsResponse)
def admin_extract_fields(
    data: ExtractFieldsRequest,
    _: None = Depends(verify_admin_token),
) -> ExtractFieldsResponse:
    """
    Propone los datos de la ficha leyendo el texto del dossier.
    Solo extrae lo que el dossier dice literalmente (null si no aparece).
    Es una PROPUESTA: el humano la revisa y la guarda (DATA_MODEL_AND_PERMISSIONS.md:
    solo humanos crean propiedades).
    """
    return extract_fields_with_ai(data.text, data.title_hint)


@router.get("/{property_id}", response_model=PropertyAdminDetail)
def admin_get_property(
    property_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> PropertyAdminDetail:
    """Propiedad completa, con el HTML del dossier."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return to_admin_read(prop, detail=True)


@router.patch("/{property_id}", response_model=PropertyAdminRead)
def admin_update_fields(
    property_id: str,
    data: PropertyFieldsUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> PropertyAdminRead:
    """Corrige los datos de la ficha (titulo, ubicacion, precio...). No cambia el estado."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(prop, field, value.strip())
    prop.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(prop)
    return to_admin_read(prop)


@router.post("/{property_id}/fetch-dossier-url", response_model=FetchDossierResponse)
def admin_fetch_dossier_url(
    property_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> FetchDossierResponse:
    """
    Recupera el HTML de un dossier subido antes como archivo a Vercel Blob
    (dossier_html_url). Blob sirve sus archivos con cabeceras que impiden
    mostrarlos como pagina (X-Frame-Options: DENY, CSP default-src 'none'),
    asi que el panel lo reimporta al nuevo formato.
    """
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    if not prop.dossier_html_url:
        raise HTTPException(status_code=404, detail="Esta propiedad no tiene un dossier subido como archivo")
    return FetchDossierResponse(html=fetch_blob_html(prop.dossier_html_url))


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
        horizon=data.horizon.strip(),
        risk_notes=data.risk_notes.strip(),
        description_html=data.description_html,
        photos=data.photos or [],
        status="draft",
        created_by="admin",
        dossier_slug=generate_dossier_slug(db, data.title),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return to_admin_read(new_property)


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
    if data.dossier_html_url is not None:
        # "" = quitar (el dossier pasa a guardarse en description_html)
        prop.dossier_html_url = data.dossier_html_url.strip() or None
    prop.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(prop)
    return to_admin_read(prop)


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
    return to_admin_read(prop)


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
