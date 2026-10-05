import type { Dictionary } from "@/lib/i18n"

export function Features({ t }: { t: Dictionary["features"] }) {
  return (
    <section id="nosotros" className="bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
        <div className="mb-20 flex flex-col items-center gap-5 text-center">
          <span className="text-xs font-light uppercase tracking-[0.35em] text-gold">{t.eyebrow}</span>
          <h2 className="max-w-2xl font-serif text-4xl font-light leading-tight text-balance text-foreground md:text-5xl">
            {t.title}
          </h2>
        </div>

        <div className="grid gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {t.items.map((feature, i) => (
            <div key={feature.title} className="flex flex-col gap-4">
              <span className="font-serif text-2xl font-light text-gold">{String(i + 1).padStart(2, "0")}</span>
              <div className="h-px w-10 bg-gold/40" />
              <h3 className="font-serif text-xl font-light text-foreground">{feature.title}</h3>
              <p className="text-sm font-light leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
