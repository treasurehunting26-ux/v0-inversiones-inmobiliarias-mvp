import type { Metadata } from "next"
import { permanentRedirect } from "next/navigation"
import { localizedPath } from "@/lib/i18n/config"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { PropertyDetail } from "@/components/catalogo/property-detail"
import { pageMetadata, type Locale } from "@/lib/i18n"
import type { Property } from "@/lib/properties-api"
import { getDictionary } from "@/lib/i18n"
import { OpportunitiesView } from "@/components/catalogo/opportunities-view"
import { CATEGORY_SLUGS, categoryFromSlug } from "@/lib/categories"

type Props = { params: Promise<{ lang: string; id: string }> }

async function fetchProperty(id: string): Promise<Property | null> {
  const api = process.env.NEXT_PUBLIC_API_URL
  if (!api) return null
  try {
    const res = await fetch(`${api}/properties/${encodeURIComponent(id)}`, { next: { revalidate: 300 } })
    return res.ok ? ((await res.json()) as Property) : null
  } catch {
    return null
  }
}

/** Titulo, descripcion e imagen al compartir la ficha (WhatsApp, redes, buscadores). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params
  const locale = lang as Locale
  // /oportunidades/reforma, /oportunidades/proyectos…: página de categoría
  const category = categoryFromSlug(locale, id)
  if (category) {
    const t = getDictionary(locale).opportunities.categories[category]
    return pageMetadata({
      locale,
      route: "opportunities",
      rest: { es: [CATEGORY_SLUGS.es[category]], en: [CATEGORY_SLUGS.en[category]] },
      title: t.metaTitle,
      description: t.metaDescription,
    })
  }
  const property = await fetchProperty(id)
  if (!property) {
    return { robots: { index: false, follow: true } }
  }
  const description = [property.asset_type, property.location, property.investment_range].filter(Boolean).join(" · ")
  const metadata = pageMetadata({
    locale,
    route: "opportunities",
    rest: [id],
    title: property.title,
    description,
  })
  const cover = property.photos?.[0]
  if (cover) {
    metadata.openGraph = { ...metadata.openGraph, images: [{ url: cover }] }
    metadata.twitter = { ...metadata.twitter, images: [cover] }
  }
  return metadata
}

export default async function PropertyDetailPage({ params }: Props) {
  const { lang, id } = await params
  const category = categoryFromSlug(lang as Locale, id)
  // Residencial es la portada del catálogo: /oportunidades/residencial -> /oportunidades
  if (category === "prime") permanentRedirect(localizedPath(lang as Locale, "opportunities"))
  if (category) return <OpportunitiesView locale={lang as Locale} active={category} />
  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      <PropertyDetail />
      <Footer />
    </main>
  )
}
