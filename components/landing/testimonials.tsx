const testimonials = [
  {
    quote:
      "Encontraron una oportunidad en Marbella que encajaba exactamente con mi perfil de riesgo. El acompañamiento fue impecable de principio a fin.",
    name: "Carlos M.",
    role: "Inversor privado · Madrid",
  },
  {
    quote:
      "La diferencia está en el criterio. No me mostraron un catálogo interminable, sino tres activos que tenían sentido para mí. Cerré en semanas.",
    name: "Isabel R.",
    role: "Family office · Ciudad de México",
  },
  {
    quote:
      "Transparencia total sobre rentabilidad y riesgos. Es el nivel de rigor que esperaría de una banca privada, aplicado al inmobiliario.",
    name: "Andreas K.",
    role: "Inversor internacional · Dubái",
  },
]

export function Testimonials() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 max-w-2xl">
          <span className="text-xs font-light uppercase tracking-[0.3em] text-accent">Confianza</span>
          <h2 className="mt-5 font-serif text-4xl font-light leading-tight text-balance text-foreground md:text-5xl">
            Inversores que ya confían en nuestro criterio
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col justify-between bg-card p-9">
              <blockquote className="font-serif text-xl font-light italic leading-relaxed text-foreground">
                {`"${t.quote}"`}
              </blockquote>
              <figcaption className="mt-8">
                <div className="text-sm font-normal text-foreground">{t.name}</div>
                <div className="mt-1 text-xs font-light uppercase tracking-[0.15em] text-muted-foreground">
                  {t.role}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
