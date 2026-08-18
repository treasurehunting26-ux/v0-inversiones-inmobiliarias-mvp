const principles = [
  {
    title: "Selección curada",
    detail: "Solo publicamos activos que superan nuestro análisis previo de ubicación, título y potencial.",
  },
  {
    title: "Tres mercados",
    detail: "Cobertura en Europa, Latinoamérica y Dubái, con criterio local en cada operación.",
  },
  {
    title: "Acompañamiento directo",
    detail: "Un asesor asignado desde la primera consulta hasta el cierre de la inversión.",
  },
]

export function Credibility() {
  return (
    <section className="border-y border-border bg-secondary py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="mb-12 text-center text-[0.7rem] font-light uppercase tracking-[0.3em] text-muted-foreground">
          Nuestra forma de trabajar
        </p>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-14">
          {principles.map((item) => (
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
