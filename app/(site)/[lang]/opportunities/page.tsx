import type { Metadata } from "next"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { CatalogoGrid } from "@/components/catalogo/catalogo-grid"
import { getDictionary, pageMetadata, type Locale } from "@/lib/i18n"

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale
  const t = getDictionary(locale).opportunities
  return pageMetadata({ locale, route: "opportunities", title: t.metaTitle, description: t.metaDescription })
}

export default async function OpportunitiesPage({ params }: Props) {
  const locale = (await params).lang as Locale
  const t = getDictionary(locale).opportunities

  return (
    <main className="min-h-screen bg-background">
      <NavBar />

      {/* Encabezado editorial sobre fondo noir */}
      <section className="relative overflow-hidden bg-[var(--color-noir)] px-6 pt-40 pb-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <span className="text-sm font-medium tracking-[0.01em] text-[var(--color-gold)]">
            {t.eyebrow}
          </span>
          <h1 className="max-w-3xl font-serif text-5xl font-light leading-[1.05] text-balance text-[var(--color-noir-foreground)] md:text-6xl">
            {t.title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[var(--color-noir-foreground)]/70">{t.intro}</p>

          <p className="mt-6 max-w-2xl border-t border-[var(--color-noir-foreground)]/15 pt-8 text-sm leading-relaxed text-[var(--color-noir-foreground)]/50">
            {t.disclaimer}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <CatalogoGrid />
      </section>

      <Footer />
    </main>
  )
}
