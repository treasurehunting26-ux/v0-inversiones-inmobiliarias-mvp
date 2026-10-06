import Link from "next/link"
import type { Dictionary, Locale } from "@/lib/i18n"
import { localizedPath } from "@/lib/i18n/config"
import { Reveal } from "@/components/dossier/reveal"

/**
 * Presentación tras la portada: quiénes somos y qué hacemos, con las
 * palabras clave del negocio (SEO) y cifras reales del catálogo.
 */
export function Intro({
  locale,
  t,
  activeCount,
}: {
  locale: Locale
  t: Dictionary["home"]["intro"]
  activeCount: number
}) {
  const facts = [
    ...(activeCount > 0 ? [{ value: String(activeCount), label: t.facts.active }] : []),
    { value: "3", label: t.facts.markets },
    { value: "100 %", label: t.facts.reviewed },
    { value: "ES · EN", label: t.facts.languages },
  ]

  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 md:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:px-10">
        <Reveal>
          <span className="flex items-center gap-4 text-xs font-light uppercase tracking-[0.3em] text-copper-ink">
            <span className="h-px w-10 shrink-0 bg-copper" aria-hidden />
            {t.eyebrow}
          </span>
          <h2 className="mt-8 font-serif text-4xl font-light leading-[1.12] text-balance text-foreground md:text-5xl lg:text-[3.4rem]">
            {t.title}
          </h2>
        </Reveal>

        <Reveal className="flex flex-col justify-end">
          {t.body.map((p) => (
            <p key={p} className="mb-5 text-base font-light leading-relaxed text-muted-foreground md:text-lg">
              {p}
            </p>
          ))}
          <Link
            href={localizedPath(locale, "opportunities")}
            className="mt-3 inline-flex w-fit items-center gap-3 text-xs font-normal uppercase tracking-[0.22em] text-foreground"
          >
            {t.cta}
            <span className="h-px w-10 bg-copper" />
          </Link>
        </Reveal>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <dl className="grid grid-cols-2 border-t border-border lg:grid-cols-4">
          {facts.map((f) => (
            <Reveal key={f.label} className="border-b border-border py-8 pr-6 lg:border-b-0">
              <div className="flex flex-col-reverse gap-3">
                <dt className="text-xs font-light uppercase tracking-[0.2em] text-muted-foreground">{f.label}</dt>
                <dd className="font-serif text-4xl font-light text-foreground md:text-5xl">{f.value}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}
