import type { Metadata } from "next"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { GuidesIndex } from "@/components/guias/guides-index"
import { guides } from "@/lib/guides"

export const metadata: Metadata = {
  title: "Guías de inversión inmobiliaria internacional | Europa, LatAm y Dubái",
  description:
    "Guías prácticas y verificables sobre inversión inmobiliaria en Europa, Latinoamérica y Dubái: zonas, fiscalidad, comparativas de mercado y preguntas frecuentes.",
  keywords:
    "guías inversión inmobiliaria, invertir inmuebles internacional, guía marbella, guía dubai, comparativa mercados inmobiliarios",
  alternates: { canonical: "/guias" },
}

export default function GuidesIndexPage() {
  return (
    <main className="min-h-screen bg-background">
      <NavBar />

      {/* Encabezado editorial noir */}
      <header className="bg-[var(--color-noir)] px-6 pb-20 pt-36 text-[var(--color-noir-foreground)]">
        <div className="mx-auto max-w-5xl">
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">Conocimiento</p>
          <h1 className="max-w-3xl font-serif text-5xl font-light leading-[1.05] text-balance md:text-6xl">
            Guías de inversión inmobiliaria internacional
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-noir-foreground)]/70">
            Análisis prácticos y verificables para invertir con criterio en Europa, Latinoamérica y Dubái. Sin
            promesas de rentabilidad. Sin atajos. Solo información útil para decidir mejor.
          </p>
        </div>
      </header>

      <GuidesIndex guides={guides} />

      <Footer />
    </main>
  )
}
