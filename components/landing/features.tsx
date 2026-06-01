const features = [
  {
    title: "Análisis profesional en cada activo",
    description:
      "Cada propiedad pasa por un proceso de validación manual antes de publicarse. Rentabilidad estimada, riesgo y horizonte, documentados con rigor.",
  },
  {
    title: "Asesoramiento personalizado",
    description:
      "Te guiamos, respondemos tus preguntas y entendemos tu perfil para presentarte solo lo que encaja con tus objetivos de inversión.",
  },
  {
    title: "Criterio profesional en cada decisión",
    description:
      "Toda operación pasa por un especialista. Nuestro proceso está diseñado para que el criterio profesional prevalezca en cada paso.",
  },
  {
    title: "Transparencia en el proceso",
    description:
      "Sabes exactamente qué activos están disponibles, quién los ha validado y cuáles son los riesgos asociados. Sin letra pequeña.",
  },
  {
    title: "Selección a la medida de tu perfil",
    description:
      "Adaptamos las oportunidades a tu presupuesto, objetivos y tolerancia al riesgo. No recibes todo el catálogo, sino lo que tiene sentido para ti.",
  },
  {
    title: "Acompañamiento hasta el cierre",
    description:
      "Cuando el momento es el adecuado, un especialista que conoce tu perfil te acompaña personalmente durante toda la operación.",
  },
]

export function Features() {
  return (
    <section id="nosotros" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16 flex flex-col gap-4 md:max-w-xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">Por qué elegirnos</span>
        <h2 className="font-serif text-4xl font-semibold text-foreground text-balance">
          Criterio profesional al servicio de decisiones que importan
        </h2>
      </div>

      <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="flex flex-col gap-4 bg-background p-8">
            <div className="h-px w-8 bg-accent" />
            <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
