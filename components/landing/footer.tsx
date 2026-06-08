import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-noir">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="flex flex-col gap-12 border-t border-noir-foreground/10 pt-12 md:flex-row md:justify-between">
          <div className="flex max-w-sm flex-col gap-4">
            <span className="font-serif text-2xl font-medium uppercase tracking-[0.2em] text-noir-foreground">
              Aterra
            </span>
            <p className="text-sm font-light leading-relaxed text-noir-foreground/50">
              Inversiones inmobiliarias de excepción en Europa, Latinoamérica y Dubái. Cada oportunidad,
              analizada con criterio profesional.
            </p>
          </div>

          <div className="flex gap-16">
            <nav className="flex flex-col gap-4">
              <span className="text-xs font-light uppercase tracking-[0.18em] text-gold">Plataforma</span>
              <Link href="/#como-funciona" className="text-sm font-light text-noir-foreground/60 transition-colors hover:text-noir-foreground">
                Cómo funciona
              </Link>
              <Link href="/oportunidades" className="text-sm font-light text-noir-foreground/60 transition-colors hover:text-noir-foreground">
                Oportunidades
              </Link>
              <Link href="/asistente" className="text-sm font-light text-noir-foreground/60 transition-colors hover:text-noir-foreground">
                Hablar con un asesor
              </Link>
            </nav>
            <nav className="flex flex-col gap-4">
              <span className="text-xs font-light uppercase tracking-[0.18em] text-gold">Mercados</span>
              <span className="text-sm font-light text-noir-foreground/60">Europa</span>
              <span className="text-sm font-light text-noir-foreground/60">Latinoamérica</span>
              <span className="text-sm font-light text-noir-foreground/60">Dubái</span>
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-noir-foreground/10 pt-8">
          <p className="text-xs font-light leading-relaxed text-noir-foreground/40">
            © {new Date().getFullYear()} Aterra. Toda inversión conlleva riesgos. La información disponible en esta
            plataforma no constituye asesoramiento financiero ni una oferta de inversión.
          </p>
        </div>
      </div>
    </footer>
  )
}
