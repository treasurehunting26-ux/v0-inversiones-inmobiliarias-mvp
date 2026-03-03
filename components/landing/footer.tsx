import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <span className="font-serif text-lg font-semibold text-foreground">InversionesInmobiliarias</span>
            <span className="text-sm text-muted-foreground">
              Oportunidades inmobiliarias analizadas con criterio profesional.
            </span>
          </div>
          <nav className="flex flex-wrap gap-6">
            <Link href="#como-funciona" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Cómo funciona
            </Link>
            <Link href="#propiedades" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Propiedades
            </Link>
            <Link href="#asistente" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Asistente
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} InversionesInmobiliarias. Toda inversión conlleva riesgos. La información
            disponible en esta plataforma no constituye asesoramiento financiero.
          </p>
        </div>
      </div>
    </footer>
  )
}
