import Link from "next/link"
import type { Dictionary, Locale } from "@/lib/i18n"
import { localizedPath } from "@/lib/i18n/config"
import { Reveal } from "@/components/dossier/reveal"

/**
 * Presentación tras la portada: qué hacemos y dónde, con las palabras
 * clave del negocio en el titular (SEO).
 */
export function Intro({ locale, t }: { locale: Locale; t: Dictionary["home"]["intro"] }) {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-28 md:py-40 lg:grid-cols-[1.15fr_0.85fr] lg:gap-24 lg:px-10">
        <Reveal>
          <h2 className="font-serif text-[2.6rem] font-light leading-[1.08] tracking-[-0.01em] text-foreground md:text-6xl lg:text-[4.25rem]">
            {t.titleLead} {t.titleAccent} {t.titleTail}
          </h2>
        </Reveal>

        <Reveal className="flex flex-col justify-end lg:pb-3">
          {t.body.map((p) => (
            <p key={p} className="mb-5 text-[1.02rem] leading-[1.75] text-muted-foreground">
              {p}
            </p>
          ))}
          <Link
            href={localizedPath(locale, "opportunities")}
            className="group mt-4 inline-flex w-fit items-center gap-4 text-[0.9rem] font-normal tracking-[0.01em] text-foreground"
          >
            {t.cta}
            <span className="h-px w-10 bg-copper transition-all duration-300 group-hover:w-16" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
