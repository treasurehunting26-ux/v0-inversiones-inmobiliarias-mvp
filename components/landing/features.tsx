const features = [
  {
    title: "Análisis profesional en cada activo",
    description:
      "Cada propiedad atraviesa un proceso de validación manual antes de publicarse. Rentabilidad estimada, riesgo y horizonte, documentados con rigor.",
  },
  {
    title: "Asesoramiento personalizado",
    description:
      "Le guiamos, respondemos sus preguntas y entendemos su perfil para presentarle únicamente lo que encaja con sus objetivos de inversión.",
  },
  {
    title: "Criterio profesional en cada decisión",
    description:
      "Toda operación pasa por un especialista. Nuestro proceso está diseñado para que el criterio profesional prevalezca en cada paso.",
  },
  {
    title: "Transparencia absoluta",
    description:
      "Sabe exactamente qué activos están disponibles, quién los ha validado y cuáles son los riesgos asociados. Sin letra pequeña.",
  },
  {
    title: "Selección a la medida de su perfil",
    description:
      "Adaptamos las oportunidades a su presupuesto, objetivos y tolerancia al riesgo. No recibe todo el catálogo, sino lo que tiene sentido para usted.",
  },
  {
    title: "Acompañamiento hasta el cierre",
    description:
      "Cuando el momento es el adecuado, un especialista que conoce su perfil le acompaña personalmente durante toda la operación.",
  },
]

export function Features() {
  return (
    <section id="nosotros" className="bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
        <div className="mb-20 flex flex-col items-center gap-5 text-center">
          <span className="text-xs font-light uppercase tracking-[0.35em] text-gold">Por qué elegirnos</span>
          <h2 className="max-w-2xl font-serif text-4xl font-light leading-tight text-balance text-foreground md:text-5xl">
            Criterio profesional al servicio de decisiones que importan
          </h2>
        </div>

        <div className="grid gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
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
