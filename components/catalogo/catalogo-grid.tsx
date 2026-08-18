"use client"

import useSWR from "swr"
import Link from "next/link"
import { fetcher, type PropertyListResponse } from "@/lib/properties-api"
import { PropertyCard } from "./property-card"

export function CatalogoGrid() {
  const { data, error, isLoading } = useSWR<PropertyListResponse>("/properties", fetcher)

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-64 animate-pulse border border-border bg-card" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 border border-border bg-card px-6 py-20 text-center">
        <p className="text-base font-semibold text-foreground">No pudimos cargar las oportunidades</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Estamos teniendo dificultades tecnicas. Por favor, vuelve a intentarlo en unos minutos o habla
          directamente con un asesor.
        </p>
        <Link
          href="/asistente"
          className="mt-2 inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Hablar con un asesor
        </Link>
      </div>
    )
  }

  const properties = data?.properties ?? []

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border border-border bg-card px-6 py-20 text-center">
        <p className="text-base font-semibold text-foreground">Aun no hay oportunidades publicadas</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Estamos seleccionando los proximos activos. Dejanos tu perfil y te avisaremos en cuanto haya
          oportunidades que encajen contigo.
        </p>
        <Link
          href="/asistente"
          className="mt-2 inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Dejar mi perfil
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
