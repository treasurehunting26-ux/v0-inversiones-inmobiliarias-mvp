import type { Metadata } from "next"
import Link from "next/link"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
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
      <header className="bg-[var(--noir)] px-6 pb-20 pt-36 text-[var(--ivory)]">
        <div className="mx-auto max-w-5xl">
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[var(--gold)]">Conocimiento</p>
          <h1 className="max-w-3xl font-serif text-5xl font-light leading-[1.05] text-balance md:text-6xl">
            Guías de inversión inmobiliaria internacional
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--ivory)]/70">
            Análisis prácticos y verificables para invertir con criterio en Europa, Latinoamérica y Dubái. Sin
            promesas de rentabilidad. Sin atajos. Solo información útil para decidir mejor.
          </p>
        </div>
      </header>

      {/* Grid de guías */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guias/${guide.slug}`}
              className="group flex flex-col justify-between rounded-sm border border-border bg-card p-8 transition-colors hover:border-[var(--gold)]"
            >
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">{guide.category}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{guide.region}</span>
                </div>
                <h2 className="font-serif text-2xl font-light leading-snug text-foreground text-balance">
                  {guide.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{guide.excerpt}</p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {guide.readingTime} de lectura
                </span>
                <span className="text-sm text-[var(--gold)] transition-transform group-hover:translate-x-1">
                  Leer guía →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
