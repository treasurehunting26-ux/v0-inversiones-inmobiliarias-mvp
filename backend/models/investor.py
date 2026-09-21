"""
Modelo SQLAlchemy: Investor
Referencia: DATA_MODEL_AND_PERMISSIONS.md (entidad 1.2)

Representa un usuario interesado / potencial inversionista.
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum
import enum

from database import Base


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

    MERCADO DEL INVERSOR vs. MERCADO DEL ACTIVO (FASE2_AGENTE_CAPTADOR.md):
    La plataforma es internacional. El lugar donde se encuentra o reside
    el inversor (investor_market/investor_country/investor_city) es un
    concepto DISTINTO e independiente del mercado inmobiliario que le
    interesa (preferred_property_market). Un inversor detectado en Dubai
    puede perfectamente buscar una oportunidad en Marbella, Madrid o
    cualquier otro mercado de activos: nunca se debe asumir que ambos
    coinciden. El mercado del activo real y publicado vive en
    Property.location; preferred_property_market aquí es solo la
    preferencia declarada/inferida del inversor, no un activo concreto.
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

    # --- Mercado del INVERSOR: dónde está, no dónde quiere invertir ---
    investor_market = Column(String, nullable=True)  # ej. "dubai_uae", "caracas_venezuela", "india", "europe", "latam", "international_other"
    investor_country = Column(String, nullable=True)
    investor_city = Column(String, nullable=True)
    language = Column(String, nullable=True)
    estimated_investment_capacity = Column(String, nullable=True)

    # --- Interés / preferencias de inversión: dónde quiere invertir ---
    preferred_property_market = Column(String, nullable=True)  # ej. "Marbella", "Madrid", "Dubai" — NUNCA igualar a investor_market
    preferred_asset_type = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
