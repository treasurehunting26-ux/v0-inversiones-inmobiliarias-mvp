import Link from "next/link"
import type { Dictionary, Locale } from "@/lib/i18n"
import { localizedPath } from "@/lib/i18n/config"
import { Reveal } from "@/components/dossier/reveal"


/**
 * Presentación tras la portada: quiénes somos y qué hacemos, con las
 * palabras clave del negocio en el titular (SEO) y tres pilares.
 */
export function Intro({ locale, t }: { locale: Locale; t: Dictionary["home"]["intro"] }) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-28 md:pt-40 lg:px-10">
        <Reveal>
          <span className="text-[0.82rem] font-light tracking-[0.01em] text-copper-ink">{t.eyebrow}</span>
        </Reveal>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-24">
          <Reveal>
            <h2 className="font-serif text-[2.6rem] font-light leading-[1.08] tracking-[-0.01em] text-foreground md:text-6xl lg:text-[4.25rem]">
              {t.titleLead}{" "}
              {t.titleAccent}{" "}
              {t.titleTail}
            </h2>
          </Reveal>

          <Reveal className="flex flex-col justify-end lg:pb-3">
            <div className="mb-8 h-px w-16 bg-copper" aria-hidden />
            {t.body.map((p) => (
              <p key={p} className="mb-5 text-[0.98rem] font-light leading-[1.85] text-muted-foreground">
                {p}
              </p>
            ))}
            <Link
              href={localizedPath(locale, "opportunities")}
              className="group mt-4 inline-flex w-fit items-center gap-4 text-[0.82rem] font-normal tracking-[0.01em] text-foreground"
            >
              {t.cta}
              <span className="h-px w-10 bg-copper transition-all duration-300 group-hover:w-16" />
            </Link>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-28 pt-24 md:pb-36 lg:px-10">
        <ul className="grid border-t border-foreground/15 md:grid-cols-3">
          {t.pillars.map((pillar, i) => (
            <Reveal
              key={pillar.title}
              className={`border-b border-foreground/10 py-10 md:border-b-0 md:py-12 ${i > 0 ? "md:border-l md:pl-10" : "md:pr-10"}`}
            >
              <li className="list-none">
                <h3 className="font-serif text-[1.7rem] font-light leading-snug text-foreground">{pillar.title}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">{pillar.detail}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
