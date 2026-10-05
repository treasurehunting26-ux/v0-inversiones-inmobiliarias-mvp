import type { Dictionary } from "@/lib/i18n"

export function Faq({ t }: { t: Dictionary["faq"] }) {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 max-w-2xl">
          <span className="text-xs font-light uppercase tracking-[0.3em] text-accent">{t.eyebrow}</span>
          <h2 className="mt-5 font-serif text-4xl font-light leading-tight text-balance text-foreground md:text-5xl">
            {t.title}
          </h2>
        </div>

        <dl className="grid grid-cols-1 gap-x-14 gap-y-10 md:grid-cols-2">
          {t.items.map((item) => (
            <div key={item.question} className="border-t border-border pt-6">
              <dt className="font-serif text-xl font-light text-foreground md:text-2xl">{item.question}</dt>
              <dd className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
