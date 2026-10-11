"""
Router FastAPI para Properties.
Referencia: MVP_TECHNICAL_BLUEPRINT.md, DATA_MODEL_AND_PERMISSIONS.md

ALCANCE: Solo lectura de propiedades publicadas.
PROHIBIDO: POST, PATCH, DELETE.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from schemas.property import PropertyRead, PropertyDetailRead, PropertyListResponse
from database import get_db
from models.property import Property

router = APIRouter(
    prefix="/properties",
    tags=["properties"]
)


@router.get("", response_model=PropertyListResponse)
def get_properties(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
) -> PropertyListResponse:
    """
    GET /properties
    
    Devuelve exclusivamente propiedades con status = "published".
    Si no hay propiedades, devuelve lista vacía.
    
    El asistente y frontend solo pueden leer propiedades publicadas.
    Nunca se exponen propiedades en draft o archived.
    """
    query = db.query(Property).filter(Property.status == "published")
    if category:
        query = query.filter(Property.category == category)
    properties = query.all()
    
    return PropertyListResponse(
        properties=[PropertyRead.model_validate(p) for p in properties],
        count=len(properties)
    )


@router.get("/dossier/{slug}", response_model=PropertyDetailRead)
def get_property_dossier(slug: str, db: Session = Depends(get_db)) -> PropertyDetailRead:
    """
    GET /properties/dossier/{slug}

    Dossier privado para compartir (ej. por WhatsApp/email) mediante un
    enlace propio con slug aleatorio. No requiere autenticacion: el slug
    actua como clave de acceso, por eso no es adivinable ni listado.

    Disponible para propiedades en draft o published (permite compartir
    antes de publicar en el catalogo). No disponible si esta archivada.
    """
    property = db.query(Property).filter(
        Property.dossier_slug == slug,
        Property.status != "archived",
    ).first()

    if not property:
        raise HTTPException(
            status_code=404,
            detail="Dossier no encontrado o no disponible"
        )

    return PropertyDetailRead.model_validate(property)


@router.get("/{property_id}", response_model=PropertyDetailRead)
def get_property(property_id: str, db: Session = Depends(get_db)) -> PropertyDetailRead:
    """
    GET /properties/{id}
    
    Devuelve una propiedad específica solo si está publicada.
    Retorna 404 si no existe o no está publicada.
    """
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.status == "published"
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=404,
            detail="Propiedad no encontrada o no disponible"
        )
    
    return PropertyDetailRead.model_validate(property)
