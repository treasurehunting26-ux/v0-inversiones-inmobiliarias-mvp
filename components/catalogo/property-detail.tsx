"use client"

import { useEffect } from "react"
import useSWR from "swr"
import Link from "next/link"
import { useParams } from "next/navigation"
import { propertyFetcher, type Property } from "@/lib/properties-api"
import { sanitizePropertyHtml } from "@/lib/sanitize-html"
import { useI18n } from "@/lib/i18n/client"
import { localizedPath } from "@/lib/i18n/config"
import { format } from "@/lib/i18n/format"
import { useBrigitte } from "@/components/brigitte/brigitte-provider"

export function PropertyDetail() {
  const { locale, dict } = useI18n()
  const t = dict.property
  const brigitte = useBrigitte()
  const params = useParams()
  const id = params?.id as string
  const { data, error, isLoading } = useSWR<Property>(
    id ? `/properties/${id}` : null,
    propertyFetcher,
  )

  // Si el visitante abre el chat en esta ficha, Brigitte sabe de que activo habla.
  const { setPageProperty } = brigitte
  useEffect(() => {
    if (!data) return
    setPageProperty({ id: data.id, title: data.title })
    return () => setPageProperty(null)
  }, [data, setPageProperty])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 pt-40 pb-28">
        <div className="h-8 w-40 animate-pulse rounded bg-card" />
        <div className="mt-6 h-12 w-3/4 animate-pulse rounded bg-card" />
        <div className="mt-10 h-64 animate-pulse rounded bg-card" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 pt-44 pb-28 text-center">
        <h1 className="font-serif text-4xl font-light text-foreground">{t.notFoundTitle}</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {t.notFoundBody}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={localizedPath(locale, "opportunities")}
            className="inline-flex items-center rounded-none border border-border px-7 py-3 text-xs font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-card"
          >
            {t.viewOpportunities}
          </Link>
          <Link
            href={localizedPath(locale, "assistant")}
            className="inline-flex items-center rounded-none bg-[var(--color-noir)] px-7 py-3 text-xs font-medium uppercase tracking-widest text-[var(--color-noir-foreground)] transition-opacity hover:opacity-90"
          >
            {t.talkToAdvisor}
          </Link>
        </div>
      </div>
    )
  }

  // El dossier puede llegar como un documento HTML completo (con su propio
  // <html>/<head>/<style>), ya sea subido como archivo (dossier_html_url) o
  // pegado directamente en el editor de contenido (description_html). En
  // ambos casos esa pagina ES la ficha: se muestra a pantalla completa, con
  // su propio diseño, sin el encabezado/CTA genericos de abajo.
  const isFullHtmlDocument = (html: string) => /<html[\s>]|<!doctype html/i.test(html)
  const fullDossierHtml = data.dossier_html_url
    ? null
    : data.description_html && isFullHtmlDocument(data.description_html)
      ? data.description_html
      : null

  if (data.dossier_html_url) {
    return (
      <iframe
        src={data.dossier_html_url}
        title={format(t.dossierOf, { title: data.title })}
        className="block h-screen w-full border-0"
        sandbox="allow-same-origin"
      />
    )
  }

  if (fullDossierHtml) {
    return (
      <iframe
        srcDoc={fullDossierHtml}
        title={format(t.dossierOf, { title: data.title })}
        className="block h-screen w-full border-0"
        sandbox="allow-same-origin"
      />
    )
  }

  const facts = [
    { label: t.facts.assetType, value: data.asset_type },
    { label: t.facts.location, value: data.location },
    { label: t.facts.investmentRange, value: data.investment_range },
    { label: t.facts.horizon, value: data.horizon },
  ]

  return (
    <article>
      {/* Cabecera noir a pantalla ancha */}
      <header className="relative overflow-hidden bg-[var(--color-noir)] px-6 pt-36 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-noir)] via-[var(--color-noir)] to-[#2a2622]" />
        <div className="relative mx-auto max-w-4xl">
          <Link
            href={localizedPath(locale, "opportunities")}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[var(--color-noir-foreground)]/60 transition-colors hover:text-[var(--color-gold)]"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M13 8H3M3 8L7 4M3 8L7 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t.back}
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[var(--color-noir-foreground)]/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--color-noir-foreground)] backdrop-blur">
              {data.asset_type}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-gold)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" />
              {t.validatedByTeam}
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-light leading-[1.08] text-balance text-[var(--color-noir-foreground)] md:text-5xl">
            {data.title}
          </h1>
          <p className="mt-3 text-lg uppercase tracking-wider text-[var(--color-noir-foreground)]/60">{data.location}</p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 pb-28">
        {/* Datos clave */}
        <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1.5 bg-background p-6">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{fact.label}</span>
              <span className="font-serif text-lg font-light text-foreground">{fact.value}</span>
            </div>
          ))}
        </div>

        {/* Dossier prediseñado fuera del panel: se muestra tal cual, a pantalla completa */}
        {data.dossier_html_url ? (
          <iframe
            src={data.dossier_html_url}
            title={format(t.dossierOf, { title: data.title })}
            className="mt-16 block h-[85vh] w-full border border-border"
            sandbox="allow-same-origin"
          />
        ) : (
          /* Dossier: contenido, fotos y video vienen todos incluidos en este bloque */
          data.description_html && (
            <div
              className="prose prose-neutral mt-16 max-w-none text-foreground [&_a]:text-[var(--color-gold)] [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-light [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-light [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_img]:my-8 [&_img]:w-full [&_img]:border [&_img]:border-border [&_img]:object-cover [&_video]:my-8 [&_video]:w-full [&_video]:border [&_video]:border-border"
              dangerouslySetInnerHTML={{ __html: sanitizePropertyHtml(data.description_html) }}
            />
          )
        )}

        {/* CTA */}
        <div className="mt-16 flex flex-col items-start gap-6 border border-border bg-[var(--color-noir)] p-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:max-w-md">
            <h3 className="font-serif text-3xl font-light text-[var(--color-noir-foreground)]">
              {t.ctaTitle}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-noir-foreground)]/70">
              {t.ctaBody}
            </p>
          </div>
          <button
            type="button"
            onClick={() => brigitte.open({ property: { id: data.id, title: data.title } })}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-none border border-[var(--color-gold)] bg-[var(--color-gold)] px-8 py-4 text-xs font-medium uppercase tracking-widest text-[var(--color-noir)] transition-all hover:bg-transparent hover:text-[var(--color-gold)]"
          >
            {t.ctaButton}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}
