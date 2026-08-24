import Link from "next/link"
import type { Property } from "@/lib/properties-api"
import { sanitizePropertyHtml } from "@/lib/sanitize-html"

interface DossierViewProps {
  property: Property
}

/**
 * Pagina de dossier: enlace privado para compartir una propiedad concreta
 * (WhatsApp, email) sin la navegacion completa de la web. Solo lleva un
 * wordmark discreto de la marca y el contenido de la ficha.
 */
export function DossierView({ property }: DossierViewProps) {
  const facts = [
    { label: "Tipo de activo", value: property.asset_type },
    { label: "Ubicación", value: property.location },
    { label: "Rango de inversión", value: property.investment_range },
    { label: "ROI estimado", value: property.roi_estimated ?? "Consultar con asesor" },
    { label: "Horizonte", value: property.horizon },
  ]

  return (
    <article className="min-h-screen bg-background">
      {/* Wordmark discreto, sin navegacion */}
      <div className="border-b border-border px-6 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="font-serif text-sm font-medium tracking-[0.2em] text-foreground uppercase"
          >
            Aterra
          </Link>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Dossier privado de inversión
          </span>
        </div>
      </div>

      <header className="relative overflow-hidden bg-[var(--color-noir)] px-6 py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-noir)] via-[var(--color-noir)] to-[#2a2622]" />
        <div className="relative mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[var(--color-noir-foreground)]/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--color-noir-foreground)] backdrop-blur">
              {property.asset_type}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-gold)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" />
              Validada por nuestro equipo
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-light leading-[1.08] text-balance text-[var(--color-noir-foreground)] md:text-5xl">
            {property.title}
          </h1>
          <p className="mt-3 text-lg uppercase tracking-wider text-[var(--color-noir-foreground)]/60">
            {property.location}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 pb-24">
        <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1.5 bg-background p-6">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{fact.label}</span>
              <span className="font-serif text-lg font-light text-foreground">{fact.value}</span>
            </div>
          ))}
        </div>

        {property.video_url && (
          <div className="mt-16">
            <video
              src={property.video_url}
              controls
              preload="none"
              poster={property.photos?.[0]}
              className="w-full rounded-none border border-border bg-[var(--color-noir)]"
            />
          </div>
        )}

        {property.photos && property.photos.length > 0 && (
          <div className="mt-16 grid grid-cols-2 gap-2 md:grid-cols-3">
            {property.photos.map((url, i) => (
              <img
                key={url}
                src={url || "/placeholder.svg"}
                alt={`${property.title} — foto ${i + 1}`}
                className="aspect-[4/3] w-full border border-border object-cover"
              />
            ))}
          </div>
        )}

        {property.description_html && (
          <div
            className="prose prose-neutral mt-16 max-w-none text-foreground [&_a]:text-[var(--color-gold)] [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-light [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-light [&_p]:leading-relaxed [&_p]:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: sanitizePropertyHtml(property.description_html) }}
          />
        )}

        <div className="mt-16 flex flex-col items-start gap-6 border border-border bg-[var(--color-noir)] p-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:max-w-md">
            <h3 className="font-serif text-3xl font-light text-[var(--color-noir-foreground)]">
              ¿Te interesa esta oportunidad?
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-noir-foreground)]/70">
              Este dossier es un documento privado preparado para ti. Habla con tu asesor para conocer el
              siguiente paso.
            </p>
          </div>
          <Link
            href={`/asistente?propiedad=${property.id}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-none border border-[var(--color-gold)] bg-[var(--color-gold)] px-8 py-4 text-xs font-medium uppercase tracking-widest text-[var(--color-noir)] transition-all hover:bg-transparent hover:text-[var(--color-gold)]"
          >
            Hablar con un asesor
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}
