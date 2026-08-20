"use client"

import useSWR from "swr"
import Link from "next/link"
import { useParams } from "next/navigation"
import { propertyFetcher, type Property } from "@/lib/properties-api"

export function PropertyDetail() {
  const params = useParams()
  const id = params?.id as string
  const { data, error, isLoading } = useSWR<Property>(
    id ? `/properties/${id}` : null,
    propertyFetcher,
  )

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
        <h1 className="font-serif text-4xl font-light text-foreground">Oportunidad no disponible</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Esta oportunidad no existe o ya no esta disponible. Explora el resto de activos validados o habla
          con un asesor.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/oportunidades"
            className="inline-flex items-center rounded-none border border-border px-7 py-3 text-xs font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-card"
          >
            Ver oportunidades
          </Link>
          <Link
            href="/asistente"
            className="inline-flex items-center rounded-none bg-[var(--color-noir)] px-7 py-3 text-xs font-medium uppercase tracking-widest text-[var(--color-noir-foreground)] transition-opacity hover:opacity-90"
          >
            Hablar con un asesor
          </Link>
        </div>
      </div>
    )
  }

  const facts = [
    { label: "Tipo de activo", value: data.asset_type },
    { label: "Ubicación", value: data.location },
    { label: "Rango de inversión", value: data.investment_range },
    { label: "ROI estimado", value: data.roi_estimated ?? "Consultar con asesor" },
    { label: "Horizonte", value: data.horizon },
  ]

  return (
    <article>
      {/* Cabecera noir a pantalla ancha */}
      <header className="relative overflow-hidden bg-[var(--color-noir)] px-6 pt-36 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-noir)] via-[var(--color-noir)] to-[#2a2622]" />
        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/oportunidades"
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
            Volver al catálogo
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[var(--color-noir-foreground)]/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--color-noir-foreground)] backdrop-blur">
              {data.asset_type}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-gold)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" />
              Validada por nuestro equipo
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

        {/* CTA */}
        <div className="mt-16 flex flex-col items-start gap-6 border border-border bg-[var(--color-noir)] p-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:max-w-md">
            <h3 className="font-serif text-3xl font-light text-[var(--color-noir-foreground)]">
              ¿Te interesa esta oportunidad?
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-noir-foreground)]/70">
              Conversa con un asesor sobre este activo. Te explicaremos los detalles y resolveremos tus dudas
              sin compromiso.
            </p>
          </div>
          <Link
            href={`/asistente?propiedad=${data.id}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-none border border-[var(--color-gold)] bg-[var(--color-gold)] px-8 py-4 text-xs font-medium uppercase tracking-widest text-[var(--color-noir)] transition-all hover:bg-transparent hover:text-[var(--color-gold)]"
          >
            Consultar esta oportunidad
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
