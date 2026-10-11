import type { Dictionary } from "@/lib/i18n"
import type { Property } from "@/lib/properties-api"

/** Franja cobre en movimiento con las oportunidades actuales (se pausa al pasar el ratón). */
export function Ticker({ t, properties }: { t: Dictionary["home"]["ticker"]; properties: Property[] }) {
  if (properties.length === 0) return null
  const items = properties.map((p) => [p.title, p.location, p.investment_range].filter(Boolean).join(" · "))
  // Se repite para que el bucle no deje huecos en pantallas anchas
  const loop = [...items, ...items, ...items, ...items]
  // Velocidad pausada y constante (~35 px/s) sin importar cuántas propiedades haya
  const duration = `${loop.length * 10}s`

  return (
    <section className="flex items-stretch overflow-hidden bg-copper-ink text-noir-foreground" aria-label={t.label}>
      <div className="relative z-10 hidden shrink-0 items-center bg-noir px-6 text-[0.82rem] font-normal tracking-[0.01em] text-gold-soft sm:flex">
        {t.label}
      </div>
      <div className="flex-1 overflow-hidden py-4">
        <ul className="bg-marquee flex w-max items-center" style={{ animationDuration: duration }} aria-hidden>
          {[0, 1].map((half) => (
            <li key={half} className="flex items-center">
              {loop.map((item, i) => (
                <span key={`${half}-${i}`} className="flex items-center whitespace-nowrap text-sm font-light tracking-[0.01em]">
                  <span className="px-8">{item}</span>
                  <span className="h-1 w-1 rotate-45 bg-gold-soft" />
                </span>
              ))}
            </li>
          ))}
        </ul>
        <ul className="sr-only">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
