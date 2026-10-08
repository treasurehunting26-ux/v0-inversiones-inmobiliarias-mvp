import type { Metadata } from "next"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { GuidesIndex } from "@/components/guias/guides-index"
import { getGuides } from "@/lib/guides"
import { getDictionary, pageMetadata, type Locale } from "@/lib/i18n"

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale
  const t = getDictionary(locale).guides
  return pageMetadata({
    locale,
    route: "guides",
    title: t.metaTitle,
    description: t.metaDescription,
    keywords: t.keywords,
  })
}

export default async function GuidesIndexPage({ params }: Props) {
  const locale = (await params).lang as Locale
  const t = getDictionary(locale).guides

  return (
    <main className="min-h-screen bg-background">
      <NavBar />

      {/* Encabezado editorial noir */}
      <header className="bg-[var(--color-noir)] px-6 pb-20 pt-36 text-[var(--color-noir-foreground)]">
        <div className="mx-auto max-w-5xl">
          <p className="mb-5 text-sm tracking-[0.01em] text-[var(--color-gold)]">{t.eyebrow}</p>
          <h1 className="max-w-3xl font-serif text-5xl font-light leading-[1.05] text-balance md:text-6xl">
            {t.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-noir-foreground)]/70">
            {t.intro}
          </p>
        </div>
      </header>

      <GuidesIndex guides={getGuides(locale)} />

      <Footer />
    </main>
  )
}
