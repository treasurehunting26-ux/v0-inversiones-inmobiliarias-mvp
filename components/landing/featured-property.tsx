import Link from "next/link"
import type { Dictionary, Locale } from "@/lib/i18n"
import { localizedPath } from "@/lib/i18n/config"
import type { Property } from "@/lib/properties-api"
import { Reveal } from "@/components/dossier/reveal"

/** Una oportunidad a todo lo ancho, con su foto de portada (sale sola del catálogo). */
export function FeaturedProperty({
  locale,
  t,
  property,
}: {
  locale: Locale
  t: Dictionary["home"]["featured"]
  property: Property
}) {
  const cover = property.photos?.[0]
  return (
    <section className="relative">
      <Link
        href={localizedPath(locale, "opportunities", property.id)}
        className="group relative block min-h-[78vh] overflow-hidden bg-noir"
      >
        {cover && (
          <img
            src={cover}
            alt={property.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/30 to-noir/10" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-6 pb-16 lg:px-10 lg:pb-20">
          <Reveal className="max-w-2xl">
            <span className="text-xs font-light uppercase tracking-[0.35em] text-gold-soft">{t.eyebrow}</span>
            <h2 className="mt-5 font-serif text-4xl font-light leading-tight text-noir-foreground md:text-6xl">
              {property.title}
            </h2>
            <p className="mt-4 text-sm font-light uppercase tracking-[0.2em] text-noir-foreground/80">
              {property.location}
              {property.asset_type ? ` · ${property.asset_type}` : ""}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-8">
              {property.investment_range && (
                <div>
                  <div className="text-[0.65rem] font-light uppercase tracking-[0.25em] text-noir-foreground/60">
                    {t.investment}
                  </div>
                  <div className="mt-1 font-serif text-2xl text-noir-foreground">{property.investment_range}</div>
                </div>
              )}
              <span className="inline-flex items-center gap-3 text-xs font-light uppercase tracking-[0.22em] text-noir-foreground">
                {t.cta}
                <span className="h-px w-10 bg-gold-soft transition-all duration-300 group-hover:w-16" />
              </span>
            </div>
          </Reveal>
        </div>
      </Link>
    </section>
  )
}
