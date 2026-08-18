import Link from "next/link"

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-villa.png"
          alt="Villa de lujo con piscina infinita al atardecer en la Costa del Sol"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-noir/85 via-noir/45 to-noir/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-noir/30" />
      </div>

      {/* Content - left aligned editorial */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="mb-6 inline-block text-xs font-light uppercase tracking-[0.35em] text-gold-soft">
            Europa · Latinoamérica · Dubái
          </span>
          <h1 className="font-serif text-5xl font-light leading-[1.02] text-balance text-noir-foreground md:text-7xl lg:text-[5.5rem]">
            Inversiones inmobiliarias de excepción
          </h1>
          <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-noir-foreground/80 md:text-lg">
            Una selección exclusiva de activos de alto valor, analizados y validados uno a uno por
            nuestro equipo de asesores. Donde el patrimonio encuentra su mejor oportunidad.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/oportunidades"
              className="border border-gold bg-gold px-9 py-3.5 text-center text-xs font-light uppercase tracking-[0.2em] text-noir transition-colors hover:bg-transparent hover:text-gold"
            >
              Ver oportunidades
            </Link>
            <Link
              href="/asistente"
              className="border border-noir-foreground/40 px-9 py-3.5 text-center text-xs font-light uppercase tracking-[0.2em] text-noir-foreground transition-colors hover:border-noir-foreground"
            >
              Hablar con un asesor
            </Link>
          </div>
        </div>
      </div>

      {/* Stats strip pinned to bottom */}
      <div className="relative z-10 mx-auto mt-20 w-full max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-px overflow-hidden border-t border-noir-foreground/15 md:grid-cols-4">
          {[
            { value: "€1.2B+", label: "En activos analizados" },
            { value: "3", label: "Mercados internacionales" },
            { value: "8–12%", label: "ROI estimado promedio" },
            { value: "100%", label: "Selección verificada" },
          ].map((stat) => (
            <div key={stat.label} className="py-7 pr-6">
              <div className="font-serif text-3xl font-light text-gold-soft md:text-4xl">{stat.value}</div>
              <div className="mt-1 text-[0.7rem] font-light uppercase tracking-[0.18em] text-noir-foreground/60">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
