import { format, type Dictionary, type Locale } from "@/lib/i18n"
import { localizedPath } from "@/lib/i18n/config"

import { MARKET_MEDIA } from "@/lib/home-media"
import { MarketCard } from "./market-card"

export function Markets({ locale, t }: { locale: Locale; t: Dictionary["markets"] }) {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 max-w-2xl">
          <span className="text-sm font-light tracking-[0.01em] text-accent">{t.eyebrow}</span>
          <h2 className="mt-5 font-serif text-4xl font-light leading-tight text-balance text-foreground md:text-5xl">
            {t.title}
          </h2>
          <p className="mt-5 text-base font-light leading-relaxed text-muted-foreground">
            {t.intro}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {t.items.map((market, i) => (
            <MarketCard
              key={market.name}
              href={localizedPath(locale, "opportunities")}
              poster={MARKET_MEDIA[i]?.poster ?? "/placeholder.svg"}
              video={MARKET_MEDIA[i]?.video ?? ""}
              alt={format(t.imageAlt, { name: market.name })}
            >
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <div className="text-[0.82rem] font-light tracking-[0.01em] text-gold-soft">
                    {market.location}
                  </div>
                  <h3 className="mt-2 font-serif text-3xl font-light text-noir-foreground">{market.name}</h3>
                  <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-noir-foreground/75">
                    {market.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-light tracking-[0.01em] text-noir-foreground">
                    {t.explore}
                    <span className="h-px w-8 bg-gold transition-all duration-300 group-hover:w-12" />
                  </span>
                </div>
            </MarketCard>
          ))}
        </div>
      </div>
    </section>
  )
}
