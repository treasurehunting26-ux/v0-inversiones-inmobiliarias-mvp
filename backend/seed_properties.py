"""
Carga inicial de propiedades de ejemplo en la base de datos.

Uso (desde la consola de Railway, dentro del servicio backend):

    python seed_properties.py            # crea y publica las propiedades
    python seed_properties.py --draft    # crea en estado draft (requiere aprobar en /admin)

Es idempotente: si una propiedad con el mismo titulo ya existe, la omite.
No necesita ADMIN_TOKEN porque escribe directamente contra DATABASE_URL.

Nota (DATA_MODEL_AND_PERMISSIONS.md): este script lo ejecuta un humano de
forma explicita, por lo que publicar aqui respeta la regla de aprobacion humana.
"""

import sys
import uuid
from datetime import datetime

from database import SessionLocal, engine, Base
from models.property import Property


# Los mercados coinciden con los tres de la landing:
# Europa, Latinoamerica y Dubai.
SEED_PROPERTIES = [
    {
        "title": "Villa frente al mar en Marbella",
        "location": "Costa del Sol, España",
        "asset_type": "Residencial de lujo",
        "investment_range": "2.500.000 € - 3.200.000 €",
        "roi_estimated": "6,5% anual",
        "horizon": "5-7 años",
        "risk_notes": (
            "Mercado consolidado con demanda internacional estable. "
            "Riesgo principal: estacionalidad del alquiler turístico y "
            "posibles cambios en la normativa local de alquiler vacacional."
        ),
    },
    {
        "title": "Edificio residencial en el Barrio de Salamanca",
        "location": "Madrid, España",
        "asset_type": "Rehabilitación integral",
        "investment_range": "4.000.000 € - 5.500.000 €",
        "roi_estimated": "8,2% anual",
        "horizon": "3-5 años",
        "risk_notes": (
            "Activo prime en zona de escasez estructural de oferta. "
            "Riesgo principal: sobrecostes y plazos de la licencia de obra; "
            "requiere reserva de contingencia sobre el presupuesto de reforma."
        ),
    },
    {
        "title": "Conjunto de apartamentos en Alfama",
        "location": "Lisboa, Portugal",
        "asset_type": "Renta residencial",
        "investment_range": "1.200.000 € - 1.800.000 €",
        "roi_estimated": "7,0% anual",
        "horizon": "4-6 años",
        "risk_notes": (
            "Fuerte demanda de alquiler urbano y turístico. "
            "Riesgo principal: evolución del marco fiscal para inversores "
            "extranjeros y limitaciones al alquiler de corta duración."
        ),
    },
    {
        "title": "Desarrollo eco-boutique en la Riviera Maya",
        "location": "Tulum, México",
        "asset_type": "Desarrollo hotelero",
        "investment_range": "900.000 USD - 1.500.000 USD",
        "roi_estimated": "12,0% anual",
        "horizon": "5-8 años",
        "risk_notes": (
            "Alto potencial de revalorización en destino emergente de lujo. "
            "Riesgo elevado: exposición a tipo de cambio, dependencia del flujo "
            "turístico internacional y verificación cuidadosa de la tenencia del suelo."
        ),
    },
    {
        "title": "Torre de oficinas en Polanco",
        "location": "Ciudad de México, México",
        "asset_type": "Comercial / oficinas",
        "investment_range": "3.000.000 USD - 4.200.000 USD",
        "roi_estimated": "9,5% anual",
        "horizon": "6-9 años",
        "risk_notes": (
            "Contratos de arrendamiento corporativo a largo plazo que aportan "
            "estabilidad de ingresos. Riesgo principal: tasa de desocupación del "
            "sector oficinas y exposición al tipo de cambio peso-dólar."
        ),
    },
    {
        "title": "Residencia con vistas a la playa Brava",
        "location": "Punta del Este, Uruguay",
        "asset_type": "Residencial de lujo",
        "investment_range": "1.100.000 USD - 1.600.000 USD",
        "roi_estimated": "6,8% anual",
        "horizon": "5-7 años",
        "risk_notes": (
            "Jurisdicción con alta seguridad jurídica y demanda regional consolidada. "
            "Riesgo principal: marcada estacionalidad, con ingresos concentrados "
            "en la temporada de verano austral."
        ),
    },
    {
        "title": "Ático con vistas al mar en Palm Jumeirah",
        "location": "Palm Jumeirah, Dubái",
        "asset_type": "Residencial de lujo",
        "investment_range": "3.500.000 USD - 4.800.000 USD",
        "roi_estimated": "11,0% anual",
        "horizon": "4-6 años",
        "risk_notes": (
            "Mercado sin impuesto sobre la renta y con fuerte entrada de capital "
            "internacional. Riesgo principal: volatilidad histórica de precios y "
            "elevada oferta nueva en fase de entrega."
        ),
    },
    {
        "title": "Apartamentos de renta corta en Dubai Marina",
        "location": "Dubai Marina, Dubái",
        "asset_type": "Renta corta gestionada",
        "investment_range": "800.000 USD - 1.300.000 USD",
        "roi_estimated": "10,5% anual",
        "horizon": "3-5 años",
        "risk_notes": (
            "Ocupación alta sostenida por el turismo de negocios y ocio. "
            "Riesgo principal: dependencia del operador de gestión y presión "
            "competitiva sobre la tarifa media por noche."
        ),
    },
]


def main() -> int:
    publish = "--draft" not in sys.argv
    target_status = "published" if publish else "draft"

    # Garantiza que las tablas existan antes de insertar.
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    created = 0
    skipped = 0

    try:
        for item in SEED_PROPERTIES:
            exists = (
                db.query(Property)
                .filter(Property.title == item["title"])
                .first()
            )
            if exists:
                print(f"[skip]   ya existe: {item['title']}")
                skipped += 1
                continue

            now = datetime.utcnow()
            db.add(
                Property(
                    id=str(uuid.uuid4()),
                    title=item["title"],
                    location=item["location"],
                    asset_type=item["asset_type"],
                    investment_range=item["investment_range"],
                    roi_estimated=item["roi_estimated"],
                    horizon=item["horizon"],
                    risk_notes=item["risk_notes"],
                    status=target_status,
                    created_by="admin",
                    approved_by="admin" if publish else None,
                    created_at=now,
                    updated_at=now,
                )
            )
            created += 1
            print(f"[create] {target_status}: {item['title']}")

        db.commit()
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        print(f"[error] {exc.__class__.__name__}: {exc}")
        return 1
    finally:
        db.close()

    total = db_count()
    print(
        f"\nResumen: {created} creadas, {skipped} omitidas. "
        f"Publicadas en la base de datos: {total}"
    )
    return 0


def db_count() -> int:
    """Cuenta las propiedades publicadas tras la carga."""
    db = SessionLocal()
    try:
        return db.query(Property).filter(Property.status == "published").count()
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
