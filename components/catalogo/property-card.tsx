import Link from "next/link"
import type { Property } from "@/lib/properties-api"

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/oportunidades/${property.id}`}
      className="group flex flex-col gap-5 border border-border bg-card p-7 transition-colors hover:border-foreground/30"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          {property.asset_type}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Validada
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-serif text-xl font-semibold leading-snug text-foreground text-balance">
          {property.title}
        </h3>
        <p className="text-sm text-muted-foreground">{property.location}</p>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-4 border-t border-border pt-5">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Inversion</span>
          <span className="text-sm font-semibold text-foreground">{property.investment_range}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">ROI estimado</span>
          <span className="text-sm font-semibold text-foreground">
            {property.roi_estimated ?? "Consultar"}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Horizonte</span>
          <span className="text-sm font-semibold text-foreground">{property.horizon}</span>
        </div>
      </div>

      <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
        Ver oportunidad
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform group-hover:translate-x-0.5"
        >
          <path
            d="M3 8H13M13 8L9 4M13 8L9 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  )
}
