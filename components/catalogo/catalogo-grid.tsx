"use client"

import useSWR from "swr"
import Link from "next/link"
import { fetcher, type PropertyListResponse } from "@/lib/properties-api"
import { PropertyCard } from "./property-card"
import { useI18n } from "@/lib/i18n/client"
import { localizedPath } from "@/lib/i18n/config"

export function CatalogoGrid() {
  const { locale, dict } = useI18n()
  const t = dict.opportunities
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
        <p className="text-base font-semibold text-foreground">{t.errorTitle}</p>
        <p className="max-w-md text-sm text-muted-foreground">
          {t.errorBody}
        </p>
        <Link
          href={localizedPath(locale, "assistant")}
          className="mt-2 inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t.talkToAdvisor}
        </Link>
      </div>
    )
  }

  const properties = data?.properties ?? []

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border border-border bg-card px-6 py-20 text-center">
        <p className="text-base font-semibold text-foreground">{t.emptyTitle}</p>
        <p className="max-w-md text-sm text-muted-foreground">
          {t.emptyBody}
        </p>
        <Link
          href={localizedPath(locale, "assistant")}
          className="mt-2 inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t.leaveProfile}
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
