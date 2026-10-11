import type { Dictionary } from "@/lib/i18n"

export function Credibility({ t }: { t: Dictionary["credibility"] }) {
  return (
    <section className="border-y border-border bg-secondary py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="mb-12 text-center text-[0.82rem] font-light tracking-[0.01em] text-muted-foreground">
          {t.eyebrow}
        </p>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-14">
          {t.items.map((item) => (
            <div key={item.title} className="flex flex-col gap-3 border-t border-border pt-6">
              <h3 className="font-serif text-2xl font-light text-foreground">{item.title}</h3>
              <p className="text-sm font-light leading-relaxed text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
