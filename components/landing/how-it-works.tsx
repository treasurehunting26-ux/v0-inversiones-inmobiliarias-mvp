const steps = [
  {
    number: "01",
    title: "Conversamos sobre tu perfil",
    description:
      "A través de una conversación natural, entendemos tu presupuesto, horizonte de inversión y tolerancia al riesgo. Sin formularios. Sin burocracia.",
  },
  {
    number: "02",
    title: "Te mostramos activos validados",
    description:
      "Cada propiedad en nuestra plataforma ha sido revisada y aprobada por nuestro equipo. Solo trabajamos con oportunidades que pasan nuestros criterios.",
  },
  {
    number: "03",
    title: "Un especialista te acompaña",
    description:
      "Cuando estás listo para avanzar, un asesor se incorpora para acompañarte. El criterio profesional guía cada decisión hasta el cierre.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 flex flex-col gap-4 md:max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Cómo funciona</span>
          <h2 className="font-serif text-4xl font-semibold text-foreground text-balance">
            Un proceso claro, controlado y sin sorpresas
          </h2>
        </div>

        <div className="grid gap-px bg-border md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-6 bg-card p-10">
              <span className="font-serif text-5xl font-semibold text-muted-foreground/40">{step.number}</span>
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
