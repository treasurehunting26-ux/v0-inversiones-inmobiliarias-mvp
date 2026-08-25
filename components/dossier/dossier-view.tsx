import Link from "next/link"
import type { Property } from "@/lib/properties-api"
import { sanitizePropertyHtml } from "@/lib/sanitize-html"
import { Reveal } from "@/components/dossier/reveal"

interface DossierViewProps {
  property: Property
}

function PhotoSlot({
  src,
  alt,
  tag,
  name,
  spec,
  size = "xl",
}: {
  src?: string | null
  alt: string
  tag: string
  name: string
  spec?: string
  size?: "xl" | "gallery"
}) {
  return (
    <div className={`dossier-slot ${size === "xl" ? "xl" : ""} ${src ? "has-media" : ""}`}>
      {src ? (
        <img src={src || "/placeholder.svg"} alt={alt} className="dossier-slot-media" loading="lazy" />
      ) : (
        <div className="dossier-slot-inner">
          <span className="dossier-slot-tag dossier-mono">{tag}</span>
          <div className="dossier-slot-name dossier-serif">{name}</div>
          {spec && <span className="dossier-slot-spec dossier-mono">{spec}</span>}
        </div>
      )}
    </div>
  )
}

/**
 * Pagina de dossier: enlace privado para compartir una propiedad concreta
 * (WhatsApp, email) sin la navegacion completa de la web. Documento
 * autocontenido, con su propio lenguaje editorial (papel, tinta, laton).
 */
export function DossierView({ property }: DossierViewProps) {
  const facts = [
    { label: "Tipo de activo", value: property.asset_type },
    { label: "Ubicación", value: property.location },
    { label: "Rango de inversión", value: property.investment_range },
    { label: "ROI estimado", value: property.roi_estimated ?? "Consultar con asesor" },
    { label: "Horizonte", value: property.horizon },
  ]

  const photos = property.photos ?? []
  // El video, si existe, ocupa el hero. Si no hay video, la primera foto
  // hace de fondo del hero y no se repite despues en la galeria.
  const heroIsVideo = Boolean(property.video_url)
  const galleryPhotos = heroIsVideo ? photos : photos.slice(1)
  const heroPhoto = heroIsVideo ? null : photos[0]
  const [featuredPhoto, ...restPhotos] = galleryPhotos

  const hasRiskNotes = Boolean(property.risk_notes && property.risk_notes.trim().length > 0)

  return (
    <article className="dossier">
      <div className="dossier-wrapper">
        <div className="dossier-stamp-bar">
          <span className="dossier-kicker dossier-mono">Colección Privada</span>
          <span className="dossier-ref-code dossier-mono">
            DOSSIER · {property.asset_type?.toUpperCase() || "OPORTUNIDAD"}
          </span>
        </div>

        <header className="dossier-hero">
          {heroIsVideo ? (
            <video
              src={property.video_url ?? undefined}
              className="dossier-slot-media"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={photos[0] || undefined}
            />
          ) : heroPhoto ? (
            <img src={heroPhoto || "/placeholder.svg"} alt={property.title} className="dossier-slot-media" />
          ) : null}
          <div className="dossier-hero-overlay" />
          <div className="dossier-hero-inner">
            <span className="dossier-hero-eyebrow dossier-mono">{property.asset_type}</span>
            <h1 className="dossier-serif">{property.title}</h1>
            <p className="dossier-hero-loc">{property.location}</p>
          </div>
        </header>

        <div className="dossier-main-body">
          <Reveal className="dossier-ledger">
            <div className="dossier-ledger-title dossier-mono">Ficha de la Inversión</div>
            {facts.map((fact) => (
              <div key={fact.label} className="dossier-ledger-row">
                <span className="dossier-ledger-label">{fact.label}</span>
                <span className="dossier-ledger-value dossier-serif">{fact.value}</span>
              </div>
            ))}
          </Reveal>

          <Reveal className="dossier-editorial-head">
            <span className="dossier-kicker dossier-mono">Presentación</span>
            <h2 className="dossier-serif">
              Una oportunidad estudiada <em>en detalle</em>
            </h2>
          </Reveal>

          {property.description_html ? (
            <Reveal>
              <div
                className="dossier-content"
                dangerouslySetInnerHTML={{ __html: sanitizePropertyHtml(property.description_html) }}
              />
            </Reveal>
          ) : null}

          {featuredPhoto ? (
            <Reveal>
              <PhotoSlot
                src={featuredPhoto}
                alt={`${property.title} — imagen destacada`}
                tag="Insertar foto"
                name="Imagen destacada"
              />
            </Reveal>
          ) : null}

          {hasRiskNotes ? (
            <Reveal className="dossier-panel-dark">
              <span className="dossier-kicker dossier-mono">Debida Diligencia</span>
              <h3 className="dossier-serif">Riesgos y consideraciones</h3>
              <p>{property.risk_notes}</p>
            </Reveal>
          ) : null}

          {restPhotos.length > 0 ? (
            <>
              <Reveal className="dossier-gallery-head dossier-editorial-head">
                <span className="dossier-kicker dossier-mono">Recorrido Visual</span>
                <h2 className="dossier-serif">
                  Postales de <em>la propiedad</em>
                </h2>
              </Reveal>
              <Reveal>
                <div className="dossier-masonry">
                  {restPhotos.map((url, i) => (
                    <div key={url} className={i === 0 && restPhotos.length > 2 ? "large" : ""}>
                      <PhotoSlot
                        src={url}
                        alt={`${property.title} — foto ${i + 2}`}
                        tag="Insertar foto"
                        name={`Foto ${i + 2}`}
                        size="gallery"
                      />
                    </div>
                  ))}
                </div>
              </Reveal>
            </>
          ) : null}

          <Reveal className="dossier-footer-seal">
            <div className="dossier-seal-ring">
              <span className="dossier-serif">A</span>
            </div>
            <div className="dossier-footer-title dossier-serif">Dossier confidencial</div>
            <div className="dossier-footer-sub dossier-mono">Presentación privada de inversión</div>
            <p className="dossier-footer-note">
              Este documento ha sido preparado exclusivamente para ti. Información y disponibilidad sujetas a
              verificación directa con nuestro equipo. No constituye oferta pública ni asesoramiento financiero.
            </p>
            <Link href={`/asistente?propiedad=${property.id}`} className="dossier-cta dossier-mono">
              Hablar con un asesor
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 8H13M13 8L9 4M13 8L9 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </Reveal>
        </div>
      </div>
    </article>
  )
}
