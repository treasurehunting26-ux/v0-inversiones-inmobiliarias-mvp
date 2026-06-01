import type { Metadata } from "next"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { CatalogoGrid } from "@/components/catalogo/catalogo-grid"

export const metadata: Metadata = {
  title: "Oportunidades de inversion inmobiliaria | Activos validados",
  description:
    "Explora oportunidades inmobiliarias seleccionadas y validadas una a una por nuestro equipo en Europa, Latinoamerica y Dubai.",
}

export default function OportunidadesPage() {
  return (
    <main className="min-h-screen bg-background">
      <NavBar />

      <section className="mx-auto max-w-6xl px-6 pt-32 pb-16">
        <div className="flex flex-col gap-4 md:max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Catalogo</span>
          <h1 className="font-serif text-4xl font-semibold text-foreground text-balance md:text-5xl">
            Oportunidades validadas, listas para analizar
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Cada activo ha sido revisado y aprobado por nuestro equipo antes de publicarse. Selecciona el que
            encaje con tu perfil y profundiza con un asesor.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-28">
        <CatalogoGrid />
      </section>

      <Footer />
    </main>
  )
}
