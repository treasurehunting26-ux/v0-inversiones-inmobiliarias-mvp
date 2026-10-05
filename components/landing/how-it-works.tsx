import type { Dictionary } from "@/lib/i18n"

export function HowItWorks({ t }: { t: Dictionary["howItWorks"] }) {
  return (
    <section id="como-funciona" className="bg-noir">
      <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
        <div className="mb-20 flex flex-col items-center gap-5 text-center">
          <span className="text-xs font-light uppercase tracking-[0.35em] text-gold">{t.eyebrow}</span>
          <h2 className="max-w-2xl font-serif text-4xl font-light leading-tight text-balance text-noir-foreground md:text-5xl">
            {t.title}
          </h2>
        </div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {t.steps.map((step, i) => (
            <div key={i} className="flex flex-col gap-6 border-t border-gold/30 pt-8">
              <span className="font-serif text-5xl font-light text-gold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-serif text-2xl font-light text-noir-foreground">{step.title}</h3>
              <p className="text-sm font-light leading-relaxed text-noir-foreground/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
