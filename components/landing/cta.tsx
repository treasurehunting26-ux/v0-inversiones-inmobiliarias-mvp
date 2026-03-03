import Link from "next/link"

export function CTA() {
  return (
    <section id="asistente" className="border-t border-border bg-primary">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-24 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:max-w-xl">
          <h2 className="font-serif text-4xl font-semibold text-primary-foreground text-balance">
            ¿Listo para encontrar tu próxima inversión inmobiliaria?
          </h2>
          <p className="text-base leading-relaxed text-primary-foreground/70">
            El asistente analiza tu perfil en minutos y te muestra oportunidades reales validadas por nuestro equipo.
            Sin compromiso. Sin automatismos.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-col gap-3">
          <Link
            href="#asistente"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-foreground px-8 py-4 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
          >
            Hablar con el asistente
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <span className="text-center text-xs text-primary-foreground/50">
            Sin registro. Sin compromiso.
          </span>
        </div>
      </div>
    </section>
  )
}
