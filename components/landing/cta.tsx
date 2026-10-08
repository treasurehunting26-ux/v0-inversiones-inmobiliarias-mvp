import Link from "next/link"
import type { Dictionary, Locale } from "@/lib/i18n"
import { localizedPath } from "@/lib/i18n/config"

export function CTA({ locale, t }: { locale: Locale; t: Dictionary["cta"] }) {
  return (
    <section id="asistente" className="relative overflow-hidden bg-noir">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-28 text-center lg:py-36">
        <span className="text-sm font-light tracking-[0.01em] text-gold">{t.eyebrow}</span>
        <h2 className="font-serif text-4xl font-light leading-tight text-balance text-noir-foreground md:text-6xl">
          {t.title}
        </h2>
        <p className="max-w-xl text-base font-light leading-relaxed text-noir-foreground/70">
          {t.body}
        </p>
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href={localizedPath(locale, "assistant")}
            className="border border-gold bg-gold px-9 py-3.5 text-sm font-light tracking-[0.01em] text-noir transition-colors hover:bg-transparent hover:text-gold"
          >
            {t.primary}
          </Link>
          <Link
            href={localizedPath(locale, "opportunities")}
            className="border border-noir-foreground/30 px-9 py-3.5 text-sm font-light tracking-[0.01em] text-noir-foreground transition-colors hover:border-noir-foreground"
          >
            {t.secondary}
          </Link>
        </div>
        <span className="text-xs font-light tracking-wide text-noir-foreground/40">
          {t.footnote}
        </span>
      </div>
    </section>
  )
}
