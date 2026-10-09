"use client"

import Link from "next/link"
import type { Property } from "@/lib/properties-api"
import { useI18n } from "@/lib/i18n/client"
import { localizedPath } from "@/lib/i18n/config"

/**
 * Ficha en formato fila para las categorías que no son Prime (reforma,
 * proyectos, comercial): los datos van por delante y la foto es pequeña,
 * para que una imagen poco vistosa no reste.
 */
export function PropertyRow({ property }: { property: Property }) {
  const { locale, dict } = useI18n()
  const t = dict.opportunities
  const cover = property.photos?.[0]

  return (
    <Link
      href={localizedPath(locale, "opportunities", property.id)}
      className="group grid grid-cols-[5.5rem_1fr] items-center gap-5 border-b border-border py-6 transition-colors hover:bg-card md:grid-cols-[7.5rem_1.6fr_1fr_1fr_auto] md:gap-8 md:px-4"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-mist">
        {cover ? (
          <img src={cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-copper-ink/40">
            {property.location?.charAt(0) ?? ""}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[0.82rem] text-copper-ink">{property.asset_type}</span>
        <h3 className="font-serif text-xl leading-snug text-foreground text-balance">{property.title}</h3>
        <p className="text-sm text-muted-foreground">{property.location}</p>
        {/* En móvil, la inversión va debajo del título */}
        <p className="mt-1 text-sm font-medium text-foreground md:hidden">{property.investment_range}</p>
      </div>

      <div className="hidden flex-col gap-1 md:flex">
        <span className="text-[0.82rem] text-muted-foreground">{t.investment}</span>
        <span className="text-sm font-medium text-foreground">{property.investment_range}</span>
      </div>

      <div className="hidden flex-col gap-1 md:flex">
        {property.horizon && (
          <>
            <span className="text-[0.82rem] text-muted-foreground">{t.horizon}</span>
            <span className="text-sm font-medium text-foreground">{property.horizon}</span>
          </>
        )}
      </div>

      <span className="hidden items-center gap-1.5 text-sm text-foreground md:inline-flex">
        {t.viewOpportunity}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-1" aria-hidden>
          <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  )
}
