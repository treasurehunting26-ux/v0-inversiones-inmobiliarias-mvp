import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { getGuide, getGuides, getGuideSlugsById } from "@/lib/guides"
import { format, getDictionary, locales, localizedPath, pageMetadata, type Locale } from "@/lib/i18n"

type Props = { params: Promise<{ lang: string; slug: string }> }

export function generateStaticParams() {
  return locales.flatMap((lang) => getGuides(lang).map((g) => ({ lang, slug: g.slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  const locale = lang as Locale
  const guide = getGuide(locale, slug)
  if (!guide) return { title: getDictionary(locale).guides.notFound }

  return pageMetadata({
    locale,
    route: "guides",
    rest: getGuideSlugsById(guide.id),
    title: guide.metaTitle,
    description: guide.metaDescription,
    keywords: guide.keywords.join(", "),
    type: "article",
  })
}

export default async function GuidePage({ params }: Props) {
  const { lang, slug } = await params
  const locale = lang as Locale
  const t = getDictionary(locale).guides
  const guide = getGuide(locale, slug)
  if (!guide) notFound()

  // JSON-LD para GEO: ser citable por motores de IA
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    dateModified: guide.dateModified,
    inLanguage: locale,
    articleSection: t.categories[guide.category],
    publisher: { "@type": "Organization", name: "B&G Consulting" },
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
            href={localizedPath(locale, "guides")}
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--color-noir-foreground)]/60 transition-colors hover:text-[var(--color-gold)]"
          >
            {t.backToAll}
          </Link>
          <div className="mb-5 flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">{t.categories[guide.category]}</span>
            <span className="text-xs text-[var(--color-noir-foreground)]/40">·</span>
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-noir-foreground)]/60">{t.regions[guide.region]}</span>
          </div>
          <h1 className="font-serif text-4xl font-light leading-[1.1] text-balance md:text-5xl">{guide.title}</h1>
          <p className="mt-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-[var(--color-noir-foreground)]/50">
            <span>{format(t.readingTime, { time: guide.readingTime })}</span>
            <span>·</span>
            <span>{format(t.updated, { date: guide.updated })}</span>
          </p>
        </div>
      </header>

      {/* Imagen destacada */}
      <div className="relative mx-auto -mt-10 aspect-[16/9] max-w-4xl overflow-hidden rounded-sm px-6 sm:-mt-14">
        <div className="relative h-full w-full overflow-hidden rounded-sm">
          <Image
            src={guide.image || "/placeholder.svg"}
            alt={guide.title}
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

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
              <h2 className="font-serif text-2xl font-light text-foreground md:text-3xl">{t.faqTitle}</h2>
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
            {t.disclaimer}
          </p>
        </div>
      </article>

      {/* CTA al asistente — obligatorio por WEB_STRUCTURE */}
      <section className="bg-[var(--color-noir)] px-6 py-20 text-center text-[var(--color-noir-foreground)]">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl font-light leading-tight text-balance md:text-4xl">
            {t.ctaTitle}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--color-noir-foreground)]/70">
            {t.ctaBody}
          </p>
          <Link
            href={localizedPath(locale, "assistant")}
            className="mt-8 inline-flex items-center justify-center gap-2 border border-[var(--color-gold)] bg-[var(--color-gold)] px-9 py-4 text-xs uppercase tracking-[0.2em] text-[var(--color-noir)] transition-colors hover:bg-transparent hover:text-[var(--color-gold)]"
          >
            {t.ctaButton}
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
