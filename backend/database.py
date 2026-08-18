"""
Configuración de base de datos PostgreSQL.
Referencia: MVP_TECHNICAL_BLUEPRINT.md
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/inversiones_db")

# Railway (y Heroku) entregan a veces la URL con el prefijo antiguo "postgres://".
# SQLAlchemy moderno requiere "postgresql://". Normalizamos para evitar fallos.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# pool_pre_ping: descarta conexiones muertas antes de usarlas (Railway cierra
# conexiones inactivas, lo que provoca errores intermitentes "connection closed").
# pool_recycle: recicla conexiones cada 5 min para no acumular conexiones zombi.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
)
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
