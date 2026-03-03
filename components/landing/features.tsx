const features = [
  {
    title: "Análisis profesional en cada activo",
    description:
      "Cada propiedad pasa por un proceso de validación manual antes de publicarse. Rentabilidad estimada, riesgo y horizonte, documentados con rigor.",
  },
  {
    title: "Asistente inteligente sin automatismos",
    description:
      "La IA te guía, responde preguntas y cualifica tu perfil. Nunca toma decisiones de inversión ni ejecuta operaciones por cuenta propia.",
  },
  {
    title: "Control humano en decisiones críticas",
    description:
      "Toda operación pasa por un especialista humano. El sistema está diseñado para que la tecnología acelere, pero el criterio humano prevalezca.",
  },
  {
    title: "Transparencia en el proceso",
    description:
      "Sabes exactamente qué activos están disponibles, quién los ha validado y cuáles son los riesgos asociados. Sin letra pequeña.",
  },
  {
    title: "Perfil de inversión personalizado",
    description:
      "El asistente adapta las oportunidades a tu presupuesto, objetivos y tolerancia al riesgo. No recibes todo el catálogo, sino lo que tiene sentido para ti.",
  },
  {
    title: "Handoff seguro a asesor humano",
    description:
      "Cuando el momento es el adecuado, tu conversación se transfiere a un especialista que conoce tu perfil y puede acompañarte hasta el cierre.",
  },
]

export function Features() {
  return (
    <section id="nosotros" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16 flex flex-col gap-4 md:max-w-xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">Por qué elegirnos</span>
        <h2 className="font-serif text-4xl font-semibold text-foreground text-balance">
          Tecnología al servicio de decisiones que importan
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
