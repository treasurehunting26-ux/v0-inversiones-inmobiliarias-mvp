import Link from "next/link"

export function CTA() {
  return (
    <section id="asistente" className="relative overflow-hidden bg-noir">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-28 text-center lg:py-36">
        <span className="text-xs font-light uppercase tracking-[0.35em] text-gold">Su próxima inversión</span>
        <h2 className="font-serif text-4xl font-light leading-tight text-balance text-noir-foreground md:text-6xl">
          Permítanos mostrarle lo que pocos llegan a ver
        </h2>
        <p className="max-w-xl text-base font-light leading-relaxed text-noir-foreground/70">
          Conversamos sobre su perfil y le presentamos oportunidades reales, validadas por nuestro
          equipo. Con la máxima discreción y sin compromiso alguno.
        </p>
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/asistente"
            className="border border-gold bg-gold px-9 py-3.5 text-xs font-light uppercase tracking-[0.2em] text-noir transition-colors hover:bg-transparent hover:text-gold"
          >
            Hablar con un asesor
          </Link>
          <Link
            href="/oportunidades"
            className="border border-noir-foreground/30 px-9 py-3.5 text-xs font-light uppercase tracking-[0.2em] text-noir-foreground transition-colors hover:border-noir-foreground"
          >
            Ver oportunidades
          </Link>
        </div>
        <span className="text-xs font-light tracking-wide text-noir-foreground/40">
          Sin registro · Sin compromiso · Absoluta confidencialidad
        </span>
      </div>
    </section>
  )
}
