import Link from "next/link"
import { dossierHtmlFor, type Property } from "@/lib/properties-api"
import { sanitizePropertyHtml } from "@/lib/sanitize-html"
import { Reveal } from "@/components/dossier/reveal"
import { DossierFrame } from "@/components/dossier/dossier-frame"
import { isFullHtmlDocument } from "@/lib/dossier-import"

interface DossierViewProps {
  property: Property
  locale?: "es" | "en"
}

/**
 * Pagina de dossier: enlace privado para compartir una propiedad concreta
 * (WhatsApp, email) sin la navegacion completa de la web. Documento
 * autocontenido, con su propio lenguaje editorial (papel, tinta, laton).
 *
 * El contenido (texto, fotos y video) se alimenta como un unico dossier
 * HTML desde el panel admin, asi que no hay galerias ni video separados
 * aqui: todo vive dentro de `description_html`, en el orden en que se
 * escribio.
 *
 * Si la propiedad tiene su dossier completo (documento HTML importado
 * desde el panel), este enlace muestra esa pagina tal cual, a pantalla
 * completa, en vez de construir la pagina con la plantilla de abajo.
 */
export function DossierView({ property, locale = "es" }: DossierViewProps) {
  // El dossier completo (documento HTML) es la pagina tal cual, en el
  // idioma del enlace (?lang=en) si hay version en ese idioma.
  const dossierHtml = dossierHtmlFor(property, locale)
  if (dossierHtml && isFullHtmlDocument(dossierHtml)) {
    return (
      <DossierFrame
        html={dossierHtml}
        title={locale === "en" ? `${property.title} dossier` : `Dossier de ${property.title}`}
        className="h-dvh"
      />
    )
  }

  const facts = [
    { label: "Tipo de activo", value: property.asset_type },
    { label: "Ubicación", value: property.location },
    { label: "Rango de inversión", value: property.investment_range },
    { label: "Horizonte", value: property.horizon },
  ]

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

          {hasRiskNotes ? (
            <Reveal className="dossier-panel-dark">
              <span className="dossier-kicker dossier-mono">Debida Diligencia</span>
              <h3 className="dossier-serif">Riesgos y consideraciones</h3>
              <p>{property.risk_notes}</p>
            </Reveal>
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
