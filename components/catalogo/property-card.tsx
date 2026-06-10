import Link from "next/link"
import type { Property } from "@/lib/properties-api"

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/oportunidades/${property.id}`}
      className="group flex flex-col overflow-hidden border border-border bg-card transition-all duration-300 hover:border-[var(--gold)]/50 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]"
    >
      {/* Cabecera visual */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--noir)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--noir)] via-[var(--noir)] to-[#2a2622]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-6xl font-light text-[var(--gold)]/25">
            {property.location?.charAt(0) ?? "·"}
          </span>
        </div>
        <div className="absolute left-5 top-5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ivory)]/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--ivory)] backdrop-blur">
            {property.asset_type}
          </span>
        </div>
        <div className="absolute bottom-5 right-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--gold)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            Validada
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col gap-5 p-7">
        <div className="flex flex-col gap-2">
          <h3 className="font-serif text-2xl font-light leading-snug text-foreground text-balance">
            {property.title}
          </h3>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">{property.location}</p>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-4 border-t border-border pt-5">
          <div className="flex flex-col gap-1">
            <span className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">Inversión</span>
            <span className="text-sm font-semibold text-foreground">{property.investment_range}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">ROI est.</span>
            <span className="text-sm font-semibold text-[var(--gold-deep,#a8893f)]">
              {property.roi_estimated ?? "Consultar"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">Horizonte</span>
            <span className="text-sm font-semibold text-foreground">{property.horizon}</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-foreground">
          Ver oportunidad
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform group-hover:translate-x-1"
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
      </div>
    </Link>
  )
}
