"""
Configuración de base de datos PostgreSQL.
Referencia: MVP_TECHNICAL_BLUEPRINT.md
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/inversiones_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependency para obtener sesión de base de datos.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
