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
      <div className="mx-auto max-w-4xl px-6 pt-32 pb-28">
        <div className="h-8 w-40 animate-pulse rounded bg-card" />
        <div className="mt-6 h-12 w-3/4 animate-pulse rounded bg-card" />
        <div className="mt-10 h-64 animate-pulse rounded bg-card" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 pt-40 pb-28 text-center">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Oportunidad no disponible</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Esta oportunidad no existe o ya no esta disponible. Explora el resto de activos validados o habla
          con un asesor.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/oportunidades"
            className="inline-flex items-center rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-card"
          >
            Ver oportunidades
          </Link>
          <Link
            href="/asistente"
            className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Hablar con un asesor
          </Link>
        </div>
      </div>
    )
  }

  const facts = [
    { label: "Tipo de activo", value: data.asset_type },
    { label: "Ubicacion", value: data.location },
    { label: "Rango de inversion", value: data.investment_range },
    { label: "ROI estimado", value: data.roi_estimated ?? "Consultar con asesor" },
    { label: "Horizonte", value: data.horizon },
  ]

  return (
    <div className="mx-auto max-w-4xl px-6 pt-32 pb-28">
      <Link
        href="/oportunidades"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
        Volver al catalogo
      </Link>

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {data.asset_type}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Validada por nuestro equipo
          </span>
        </div>
        <h1 className="font-serif text-4xl font-semibold leading-tight text-foreground text-balance md:text-5xl">
          {data.title}
        </h1>
        <p className="text-lg text-muted-foreground">{data.location}</p>
      </div>

      <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-1.5 bg-background p-6">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{fact.label}</span>
            <span className="text-base font-semibold text-foreground">{fact.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-4">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Consideraciones de riesgo</h2>
        <p className="leading-relaxed text-muted-foreground">{data.risk_notes}</p>
      </div>

      <div className="mt-16 flex flex-col items-start gap-5 border border-border bg-card p-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:max-w-md">
          <h3 className="font-serif text-2xl font-semibold text-foreground">
            ¿Te interesa esta oportunidad?
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Conversa con un asesor sobre este activo. Te explicaremos los detalles y resolveremos tus dudas
            sin compromiso.
          </p>
        </div>
        <Link
          href={`/asistente?propiedad=${data.id}`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
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
  )
}
