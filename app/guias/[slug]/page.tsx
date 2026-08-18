import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { getGuide, getAllGuideSlugs } from "@/lib/guides"

export function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return { title: "Guía no encontrada" }

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    keywords: guide.keywords.join(", "),
    alternates: { canonical: `/guias/${guide.slug}` },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      type: "article",
    },
  }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  // JSON-LD para GEO: ser citable por motores de IA
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    dateModified: "2026-01-15",
    inLanguage: "es",
    articleSection: guide.category,
  }

  const faqSchema =
    guide.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null

  return (
    <main className="min-h-screen bg-background">
      <NavBar />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* Cabecera noir */}
      <header className="bg-[var(--color-noir)] px-6 pb-16 pt-36 text-[var(--color-noir-foreground)]">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/guias"
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--color-noir-foreground)]/60 transition-colors hover:text-[var(--color-gold)]"
          >
            ← Todas las guías
          </Link>
          <div className="mb-5 flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">{guide.category}</span>
            <span className="text-xs text-[var(--color-noir-foreground)]/40">·</span>
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-noir-foreground)]/60">{guide.region}</span>
          </div>
          <h1 className="font-serif text-4xl font-light leading-[1.1] text-balance md:text-5xl">{guide.title}</h1>
          <p className="mt-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-[var(--color-noir-foreground)]/50">
            <span>{guide.readingTime} de lectura</span>
            <span>·</span>
            <span>Actualizado {guide.updated}</span>
          </p>
        </div>
      </header>

      {/* Contenido */}
      <article className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          {guide.sections.map((section, i) => (
            <section key={i} className="mb-12">
              <h2 className="font-serif text-2xl font-light leading-snug text-foreground text-balance md:text-3xl">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, j) => (
                <p key={j} className="mt-5 text-base leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-6 space-y-3">
                  {section.bullets.map((b, k) => (
                    <li key={k} className="flex gap-3 text-base leading-relaxed text-muted-foreground">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-gold)]" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* FAQs */}
          {guide.faqs.length > 0 && (
            <section className="mt-16 border-t border-border pt-12">
              <h2 className="font-serif text-2xl font-light text-foreground md:text-3xl">Preguntas frecuentes</h2>
              <dl className="mt-8 space-y-8">
                {guide.faqs.map((faq, i) => (
                  <div key={i}>
                    <dt className="font-serif text-lg font-normal text-foreground">{faq.question}</dt>
                    <dd className="mt-3 text-base leading-relaxed text-muted-foreground">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Aviso */}
          <p className="mt-16 border-l-2 border-[var(--color-gold)] pl-5 text-sm italic leading-relaxed text-muted-foreground">
            Este contenido es informativo y no constituye asesoramiento financiero, fiscal ni legal. Cada operación
            debe analizarse de forma individualizada con asesoramiento profesional.
          </p>
        </div>
      </article>

      {/* CTA al asistente — obligatorio por WEB_STRUCTURE */}
      <section className="bg-[var(--color-noir)] px-6 py-20 text-center text-[var(--color-noir-foreground)]">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl font-light leading-tight text-balance md:text-4xl">
            ¿Quieres explorar oportunidades reales con este criterio?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--color-noir-foreground)]/70">
            Conversa con un asesor para entender qué activos validados encajan con tu perfil y objetivos de inversión.
          </p>
          <Link
            href="/asistente"
            className="mt-8 inline-flex items-center justify-center gap-2 border border-[var(--color-gold)] bg-[var(--color-gold)] px-9 py-4 text-xs uppercase tracking-[0.2em] text-[var(--color-noir)] transition-colors hover:bg-transparent hover:text-[var(--color-gold)]"
          >
            Hablar con un asesor
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
