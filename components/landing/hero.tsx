import Link from "next/link"

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-36">
      <div className="flex flex-col items-start gap-8 md:max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Oportunidades validadas por expertos
        </span>
        <h1 className="font-serif text-5xl font-semibold leading-tight text-balance text-foreground md:text-6xl">
          Accede a oportunidades inmobiliarias analizadas con criterio profesional
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
          Nuestro asistente inteligente analiza tu perfil de inversor y te conecta con activos inmobiliarios
          validados manualmente por nuestro equipo. Tú decides, nosotros facilitamos.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="#asistente"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Hablar con el asistente
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link
            href="#propiedades"
            className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card"
          >
            Ver propiedades
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-2 gap-4 border-t border-border pt-12 md:grid-cols-4">
        {[
          { value: "+50", label: "Propiedades analizadas" },
          { value: "100%", label: "Validación humana" },
          { value: "8–12%", label: "ROI estimado promedio" },
          { value: "0", label: "Decisiones automatizadas" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1">
            <span className="font-serif text-3xl font-semibold text-foreground">{stat.value}</span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
