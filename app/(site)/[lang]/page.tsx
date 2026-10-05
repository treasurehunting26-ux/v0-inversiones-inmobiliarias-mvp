import { NavBar } from "@/components/landing/nav-bar"
import { Hero } from "@/components/landing/hero"
import { Credibility } from "@/components/landing/credibility"
import { Markets } from "@/components/landing/markets"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Showcase } from "@/components/landing/showcase"
import { Features } from "@/components/landing/features"
import { Faq } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { getDictionary, type Locale } from "@/lib/i18n"

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const locale = (await params).lang as Locale
  const t = getDictionary(locale)

  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      <Hero locale={locale} t={t.hero} />
      <Credibility t={t.credibility} />
      <Markets locale={locale} t={t.markets} />
      <HowItWorks t={t.howItWorks} />
      <Showcase locale={locale} t={t.showcase} />
      <Features t={t.features} />
      <Faq t={t.faq} />
      <CTA locale={locale} t={t.cta} />
      <Footer />
    </main>
  )
}
