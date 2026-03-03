"""
Modelo SQLAlchemy: Investor
Referencia: DATA_MODEL_AND_PERMISSIONS.md (entidad 1.2)

Representa un usuario interesado / potencial inversionista.
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum
import enum

from backend.database import Base


class QualificationStatus(str, enum.Enum):
    """Estados de cualificación del inversor."""
    UNQUALIFIED = "unqualified"
    QUALIFIED = "qualified"
    HIGH_INTENT = "high_intent"


class Investor(Base):
    """
    Entidad Investor.
    
    Reglas (DATA_MODEL_AND_PERMISSIONS.md):
    - El asistente puede crear y actualizar campos de cualificación
    - El asistente NO puede eliminar inversores
    - El asistente NO puede marcar cierres
    """
    __tablename__ = "investors"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    budget_range = Column(String, nullable=True)
    investment_goal = Column(String, nullable=True)
    horizon = Column(String, nullable=True)
    risk_profile = Column(String, nullable=True)
    qualification_status = Column(
        String,
        default=QualificationStatus.UNQUALIFIED.value,
        nullable=False
    )
    source = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
