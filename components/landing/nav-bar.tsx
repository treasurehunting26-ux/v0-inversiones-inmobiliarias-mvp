import Link from "next/link"

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-serif text-xl font-semibold text-foreground">
          InversionesInmobiliarias
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#como-funciona" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Cómo funciona
          </Link>
          <Link href="/oportunidades" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Oportunidades
          </Link>
          <Link href="/#nosotros" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Nosotros
          </Link>
        </nav>
        <Link
          href="/asistente"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Hablar con un asesor
        </Link>
      </div>
    </header>
  )
}
