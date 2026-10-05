import Link from "next/link"
import type { Dictionary, Locale } from "@/lib/i18n"
import { localizedPath } from "@/lib/i18n/config"

export function Showcase({ locale, t }: { locale: Locale; t: Dictionary["showcase"] }) {
  return (
    <section className="bg-background">
      <div className="grid items-stretch lg:grid-cols-2">
        {/* Image */}
        <div className="relative min-h-[420px] lg:min-h-[640px]">
          <img
            src="/images/interior-lounge.png"
            alt={t.imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col justify-center gap-8 px-6 py-20 lg:px-20 lg:py-0">
          <span className="text-xs font-light uppercase tracking-[0.35em] text-gold">{t.eyebrow}</span>
          <h2 className="max-w-xl font-serif text-4xl font-light leading-tight text-balance text-foreground md:text-5xl">
            {t.title}
          </h2>
          <p className="max-w-lg text-base font-light leading-relaxed text-muted-foreground">
            {t.body}
          </p>
          <div className="flex flex-col gap-6 pt-2">
            {t.items.map((item) => (
              <div key={item.k} className="flex gap-5 border-t border-border pt-5">
                <span className="font-serif text-lg font-light text-gold">—</span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium uppercase tracking-[0.12em] text-foreground">{item.k}</span>
                  <span className="text-sm font-light text-muted-foreground">{item.v}</span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href={localizedPath(locale, "opportunities")}
            className="mt-2 w-fit border border-foreground/30 px-8 py-3.5 text-xs font-light uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            {t.cta}
          </Link>
        </div>
      </div>
    </section>
  )
}
