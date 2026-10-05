import Link from "next/link"
import type { Dictionary, Locale } from "@/lib/i18n"
import { localizedPath } from "@/lib/i18n/config"

export function Hero({ locale, t }: { locale: Locale; t: Dictionary["hero"] }) {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-villa.png"
          alt={t.imageAlt}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-noir/85 via-noir/45 to-noir/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-noir/30" />
      </div>

      {/* Content - left aligned editorial */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-28 lg:px-10 lg:pt-32">
        <div className="max-w-2xl">
          <span className="mb-6 inline-block text-xs font-light uppercase tracking-[0.35em] text-gold-soft">
            {t.eyebrow}
          </span>
          <h1 className="font-serif text-5xl font-light leading-[1.02] text-balance text-noir-foreground md:text-7xl lg:text-[5.5rem]">
            {t.title}
          </h1>
          <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-noir-foreground/80 md:text-lg">
            {t.body}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href={localizedPath(locale, "opportunities")}
              className="border border-gold bg-gold px-9 py-3.5 text-center text-xs font-light uppercase tracking-[0.2em] text-noir transition-colors hover:bg-transparent hover:text-gold"
            >
              {t.primary}
            </Link>
            <Link
              href={localizedPath(locale, "assistant")}
              className="border border-noir-foreground/40 px-9 py-3.5 text-center text-xs font-light uppercase tracking-[0.2em] text-noir-foreground transition-colors hover:border-noir-foreground"
            >
              {t.secondary}
            </Link>
          </div>
        </div>
      </div>

    </section>
  )
}
