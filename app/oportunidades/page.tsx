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

      {/* Encabezado editorial sobre fondo noir */}
      <section className="relative overflow-hidden bg-[var(--noir)] px-6 pt-40 pb-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <span className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--gold)]">
            Catálogo · Activos verificados
          </span>
          <h1 className="max-w-3xl font-serif text-5xl font-light leading-[1.05] text-balance text-[var(--ivory)] md:text-6xl">
            Oportunidades de inversión, seleccionadas una a una
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[var(--ivory)]/70">
            Cada activo ha sido revisado y aprobado por nuestro equipo antes de publicarse. Elige el que encaje
            con tu perfil y profundiza con un asesor dedicado.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-12 gap-y-6 border-t border-[var(--ivory)]/15 pt-8">
            {[
              { value: "100%", label: "Verificación manual" },
              { value: "3", label: "Mercados internacionales" },
              { value: "8–12%", label: "ROI estimado promedio" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-serif text-3xl font-light text-[var(--gold)]">{stat.value}</span>
                <span className="text-xs uppercase tracking-widest text-[var(--ivory)]/50">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <CatalogoGrid />
      </section>

      <Footer />
    </main>
  )
}
