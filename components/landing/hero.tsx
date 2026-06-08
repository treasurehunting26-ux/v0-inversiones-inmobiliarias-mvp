import Link from "next/link"

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-villa.png"
          alt="Villa de lujo con piscina infinita al atardecer en la Costa del Sol"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/70 via-noir/40 to-noir/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <span className="mb-8 text-xs font-light uppercase tracking-[0.35em] text-gold">
          Europa · Latinoamérica · Dubái
        </span>
        <h1 className="font-serif text-5xl font-light leading-[1.05] text-balance text-noir-foreground md:text-7xl lg:text-8xl">
          Inversiones inmobiliarias de excepción
        </h1>
        <p className="mt-8 max-w-2xl text-base font-light leading-relaxed text-noir-foreground/80 md:text-lg">
          Una selección exclusiva de activos de alto valor, analizados y validados uno a uno por
          nuestro equipo de asesores. Donde el patrimonio encuentra su mejor oportunidad.
        </p>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/oportunidades"
            className="border border-gold bg-gold px-9 py-3.5 text-xs font-light uppercase tracking-[0.2em] text-noir transition-colors hover:bg-transparent hover:text-gold"
          >
            Ver oportunidades
          </Link>
          <Link
            href="/asistente"
            className="border border-noir-foreground/40 px-9 py-3.5 text-xs font-light uppercase tracking-[0.2em] text-noir-foreground transition-colors hover:border-noir-foreground"
          >
            Hablar con un asesor
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-12 w-7 items-start justify-center rounded-full border border-noir-foreground/30 p-2">
          <div className="h-2 w-1 rounded-full bg-gold" />
        </div>
      </div>
    </section>
  )
}
