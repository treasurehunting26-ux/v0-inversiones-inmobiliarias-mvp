"""
Migracion: anade columnas de contenido enriquecido y dossier a "properties".

Se ejecuta UNA VEZ desde la consola del servicio en Railway:

    python migrate_add_content_fields.py

Es idempotente: usa "IF NOT EXISTS", se puede ejecutar varias veces sin riesgo.
Tambien genera el dossier_slug para las propiedades que ya existan y no
tengan uno (por ejemplo, las 8 propiedades de ejemplo cargadas antes).
"""

import re
import uuid

from sqlalchemy import text

from database import engine, SessionLocal
from models.property import Property


def slugify(value: str) -> str:
    normalized = value.lower().strip()
    normalized = re.sub(r"[^a-z0-9\s-]", "", normalized)
    normalized = re.sub(r"[\s-]+", "-", normalized).strip("-")
    return normalized or "propiedad"


def add_columns() -> None:
    statements = [
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS description_html TEXT",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS photos JSON",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_url VARCHAR",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS dossier_slug VARCHAR",
    ]
    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))
            print(f"[migrate] ejecutado: {stmt}")

        # El indice unico se crea aparte para poder usar IF NOT EXISTS
        conn.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS ix_properties_dossier_slug "
                "ON properties (dossier_slug)"
            )
        )
        print("[migrate] indice unico en dossier_slug verificado")


def backfill_slugs() -> None:
    db = SessionLocal()
    try:
        pending = db.query(Property).filter(Property.dossier_slug.is_(None)).all()
        for prop in pending:
            base = slugify(prop.title)
            candidate = f"{base}-{uuid.uuid4().hex[:6]}"
            prop.dossier_slug = candidate
            print(f"[migrate] slug asignado a '{prop.title}': {candidate}")
        db.commit()
        print(f"[migrate] {len(pending)} propiedades actualizadas con dossier_slug")
    finally:
        db.close()


if __name__ == "__main__":
    add_columns()
    backfill_slugs()
    print("[migrate] completado")
