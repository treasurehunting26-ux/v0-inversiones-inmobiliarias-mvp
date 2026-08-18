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
      "Cada propiedad en nuestra plataforma ha sido revisada y aprobada por nuestro equipo. Solo trabajamos con oportunidades que superan nuestros criterios.",
  },
  {
    number: "03",
    title: "Un especialista te acompaña",
    description:
      "Cuando estás listo para avanzar, un asesor se incorpora para guiarte. El criterio profesional acompaña cada decisión hasta el cierre.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-noir">
      <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
        <div className="mb-20 flex flex-col items-center gap-5 text-center">
          <span className="text-xs font-light uppercase tracking-[0.35em] text-gold">El proceso</span>
          <h2 className="max-w-2xl font-serif text-4xl font-light leading-tight text-balance text-noir-foreground md:text-5xl">
            Un proceso discreto, riguroso y a su medida
          </h2>
        </div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-6 border-t border-gold/30 pt-8">
              <span className="font-serif text-5xl font-light text-gold">{step.number}</span>
              <h3 className="font-serif text-2xl font-light text-noir-foreground">{step.title}</h3>
              <p className="text-sm font-light leading-relaxed text-noir-foreground/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
