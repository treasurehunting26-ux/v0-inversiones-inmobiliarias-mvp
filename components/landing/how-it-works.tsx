import type { Dictionary } from "@/lib/i18n"
import { Reveal } from "@/components/dossier/reveal"

export function HowItWorks({ t }: { t: Dictionary["howItWorks"] }) {
  return (
    <section id="como-funciona" className="bg-mist">
      <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
        <div className="mb-20 flex flex-col items-center gap-5 text-center">
          <span className="text-sm font-light tracking-[0.01em] text-copper-ink">{t.eyebrow}</span>
          <h2 className="max-w-2xl font-serif text-4xl font-light leading-tight text-balance text-foreground md:text-5xl">
            {t.title}
          </h2>
        </div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {t.steps.map((step, i) => (
            <Reveal key={i} className="flex flex-col gap-6 border-t border-copper/50 pt-8">
              <span className="font-serif text-5xl font-light text-copper-ink">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-serif text-2xl font-light text-foreground">{step.title}</h3>
              <p className="text-sm font-light leading-relaxed text-muted-foreground">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
