import { NavBar } from "@/components/landing/nav-bar"
import { Hero } from "@/components/landing/hero"
import { Manifesto } from "@/components/landing/manifesto"
import { FeaturedProperty } from "@/components/landing/featured-property"
import { OpportunitiesRail } from "@/components/landing/opportunities-rail"
import { Ticker } from "@/components/landing/ticker"
import { Markets } from "@/components/landing/markets"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Features } from "@/components/landing/features"
import { Faq } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { getDictionary, type Locale } from "@/lib/i18n"
import { getPublishedProperties } from "@/lib/properties-api"

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const locale = (await params).lang as Locale
  const t = getDictionary(locale)

  // Secciones dinámicas: salen solas del catálogo publicado
  const properties = await getPublishedProperties()
  const withCover = properties.filter((p) => p.photos?.[0])
  const featured = withCover[0]
  const rail = withCover.filter((p) => p.id !== featured?.id)

  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      <Hero locale={locale} t={t.hero} />
      <Manifesto t={t.home.manifesto} />
      {featured && <FeaturedProperty locale={locale} t={t.home.featured} property={featured} />}
      {rail.length > 0 && <OpportunitiesRail locale={locale} t={t.home.rail} properties={rail} />}
      <Ticker t={t.home.ticker} properties={withCover.length ? withCover : properties} />
      <Markets locale={locale} t={t.markets} />
      <HowItWorks t={t.howItWorks} />
      <Features t={t.features} />
      <Faq t={t.faq} />
      <CTA locale={locale} t={t.cta} />
      <Footer />
    </main>
  )
}
