"""
Router: Source Registry del Agente Captador
Referencia: FASE2_AGENTE_CAPTADOR.md (Source Registry — expansión internacional)

Endpoints administrativos mínimos para gestionar las fuentes de
prospección desde /admin, sustituyendo la dependencia exclusiva de
variables de entorno. Todos requieren X-Admin-Token (ver
routers/admin_properties.py::verify_admin_token).

Este router NUNCA ejecuta el ciclo de captación ni contacta a nadie:
solo gestiona metadata de fuentes (alta, edición, activar/desactivar).
El ciclo real sigue viviendo en routers/prospecting.py.
"""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.prospecting_source import ProspectingSource
from routers.admin_properties import verify_admin_token
from schemas.prospecting_source import (
    ProspectingSourceCreate,
    ProspectingSourceListResponse,
    ProspectingSourceMigrationResult,
    ProspectingSourceRead,
    ProspectingSourceUpdate,
)
from services.source_registry import list_all_sources, migrate_env_sources_into_registry

router = APIRouter(
    prefix="/prospecting/sources",
    tags=["prospecting-sources"],
)


@router.get(
    "",
    response_model=ProspectingSourceListResponse,
    summary="Listar todas las fuentes del registry (activas e inactivas)",
)
def admin_list_sources(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingSourceListResponse:
    sources = list_all_sources(db)
    return ProspectingSourceListResponse(
        sources=[ProspectingSourceRead.model_validate(s) for s in sources],
        count=len(sources),
    )


@router.post(
    "",
    response_model=ProspectingSourceRead,
    status_code=201,
    summary="Registrar una nueva fuente de prospección",
    description="""
    Crea una fuente en el registry. No ejecuta ninguna lectura de feed
    ni scraping: solo persiste la metadata. mercado del inversor
    (investor_market) y mercado del activo (property_market) se guardan
    como campos independientes, nunca se infiere uno a partir del otro.
    """,
)
def admin_create_source(
    data: ProspectingSourceCreate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingSourceRead:
    existing = db.query(ProspectingSource).filter(ProspectingSource.name == data.name).first()
    if existing:
        raise HTTPException(
            status_code=409, detail=f"Ya existe una fuente con el nombre '{data.name}'"
        )

    now = datetime.utcnow()
    source = ProspectingSource(
        id=str(uuid.uuid4()),
        name=data.name,
        url=data.url,
        source_type=data.source_type,
        country=data.country,
        city=data.city,
        region=data.region,
        language=data.language,
        investor_market=data.investor_market,
        property_market=data.property_market,
        priority=data.priority,
        legal_status=data.legal_status,
        active=data.active,
        created_at=now,
        updated_at=now,
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return ProspectingSourceRead.model_validate(source)


@router.patch(
    "/{source_id}",
    response_model=ProspectingSourceRead,
    summary="Actualizar una fuente existente",
    description="Solo actualiza los campos enviados; el resto se mantiene igual.",
)
def admin_update_source(
    source_id: str,
    data: ProspectingSourceUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingSourceRead:
    source = db.query(ProspectingSource).filter(ProspectingSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Fuente no encontrada")

    updates = data.model_dump(exclude_unset=True)
    if "name" in updates and updates["name"] != source.name:
        duplicate = (
            db.query(ProspectingSource)
            .filter(ProspectingSource.name == updates["name"], ProspectingSource.id != source_id)
            .first()
        )
        if duplicate:
            raise HTTPException(
                status_code=409, detail=f"Ya existe una fuente con el nombre '{updates['name']}'"
            )

    for field, value in updates.items():
        setattr(source, field, value)
    source.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(source)
    return ProspectingSourceRead.model_validate(source)


@router.post(
    "/{source_id}/activate",
    response_model=ProspectingSourceRead,
    summary="Activar una fuente (el Captador volverá a consultarla)",
)
def admin_activate_source(
    source_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingSourceRead:
    source = db.query(ProspectingSource).filter(ProspectingSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Fuente no encontrada")

    source.active = True
    source.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(source)
    return ProspectingSourceRead.model_validate(source)


@router.post(
    "/{source_id}/deactivate",
    response_model=ProspectingSourceRead,
    summary="Desactivar una fuente (el Captador dejará de consultarla)",
)
def admin_deactivate_source(
    source_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingSourceRead:
    source = db.query(ProspectingSource).filter(ProspectingSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Fuente no encontrada")

    source.active = False
    source.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(source)
    return ProspectingSourceRead.model_validate(source)


@router.post(
    "/migrate-from-env",
    response_model=ProspectingSourceMigrationResult,
    summary="Migración: importa al registry las fuentes definidas por variables de entorno",
    description="""
    Migración puntual (Source Registry — expansión internacional): lee
    PROSPECTING_RSS_SOURCES / PROSPECTING_SOURCES_METADATA y crea una
    fila en el registry por cada fuente que aún no exista por nombre.

    Idempotente: una fuente ya presente en el registry nunca se duplica
    ni se sobrescribe. Pensada para ejecutarse una sola vez tras
    desplegar este cambio.
    """,
)
def admin_migrate_sources_from_env(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin_token),
) -> ProspectingSourceMigrationResult:
    result = migrate_env_sources_into_registry(db)
    return ProspectingSourceMigrationResult(**result)
