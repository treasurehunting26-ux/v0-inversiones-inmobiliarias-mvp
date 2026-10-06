"use client"

import Link from "next/link"
import { useRef } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Dictionary, Locale } from "@/lib/i18n"
import { localizedPath } from "@/lib/i18n/config"
import type { Property } from "@/lib/properties-api"
import { Reveal } from "@/components/dossier/reveal"

/** Carrusel horizontal de oportunidades con su portada (desliza con el dedo o con las flechas). */
export function OpportunitiesRail({
  locale,
  t,
  properties,
}: {
  locale: Locale
  t: Dictionary["home"]["rail"]
  properties: Property[]
}) {
  const track = useRef<HTMLUListElement>(null)
  const scroll = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" })
  }

  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="flex items-center gap-4 text-xs font-light uppercase tracking-[0.35em] text-copper-ink">
              <span className="h-px w-10 bg-copper" aria-hidden />
              {t.eyebrow}
            </span>
            <h2 className="mt-5 font-serif text-4xl font-light leading-tight text-foreground md:text-5xl">{t.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label={t.prev}
              className="flex h-12 w-12 items-center justify-center border border-noir/25 text-noir transition-colors hover:border-noir hover:bg-noir hover:text-noir-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label={t.next}
              className="flex h-12 w-12 items-center justify-center border border-noir/25 text-noir transition-colors hover:border-noir hover:bg-noir hover:text-noir-foreground"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Reveal>
      </div>

      <ul
        ref={track}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-4 [scrollbar-width:none] lg:px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] [&::-webkit-scrollbar]:hidden"
      >
        {properties.map((p) => (
          <li key={p.id} className="w-[82vw] shrink-0 snap-start sm:w-[46vw] lg:w-[30rem]">
            <Link href={localizedPath(locale, "opportunities", p.id)} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-noir">
                {p.photos?.[0] ? (
                  <img
                    src={p.photos[0]}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-serif text-7xl text-gold-soft/30">
                    {p.location?.charAt(0) ?? "·"}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent" />
                {p.asset_type && (
                  <span className="absolute left-5 top-5 bg-noir-foreground/90 px-3 py-1 text-[0.65rem] font-normal uppercase tracking-[0.2em] text-noir">
                    {p.asset_type}
                  </span>
                )}
              </div>
              <div className="border-b border-border py-6">
                <h3 className="font-serif text-2xl font-light text-foreground transition-colors group-hover:text-copper-ink">
                  {p.title}
                </h3>
                <p className="mt-2 text-xs font-light uppercase tracking-[0.18em] text-muted-foreground">{p.location}</p>
                {p.investment_range && <p className="mt-4 font-serif text-xl text-foreground">{p.investment_range}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-10 max-w-7xl px-6 lg:px-10">
        <Link
          href={localizedPath(locale, "opportunities")}
          className="inline-flex items-center gap-3 text-xs font-normal uppercase tracking-[0.22em] text-foreground"
        >
          {t.viewAll}
          <span className="h-px w-10 bg-copper" />
        </Link>
      </div>
    </section>
  )
}
