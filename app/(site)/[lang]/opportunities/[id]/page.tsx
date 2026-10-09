import type { Metadata } from "next"
import { permanentRedirect } from "next/navigation"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { PropertyDetail } from "@/components/catalogo/property-detail"
import { pageMetadata, type Locale } from "@/lib/i18n"
import { dossierHtmlFor, type Property } from "@/lib/properties-api"
import { breadcrumbSchema, dossierLead, dossierPlainText, jsonLd, listingSchema } from "@/lib/seo"
import { SITE_URL, localizedPath } from "@/lib/i18n/config"
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
  // Descripción: datos clave + comienzo del texto del dossier (lo que ven buscadores e IA)
  const facts = [property.asset_type, property.location, property.investment_range].filter(Boolean).join(", ")
  // ~160 caracteres: lo que muestra Google en el resultado
  const summary = dossierLead(dossierHtmlFor(property, locale), Math.max(60, 158 - facts.length))
  const description = summary ? `${facts}. ${summary}` : facts
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

  // La ficha se pinta ya en el servidor (sin esqueleto de carga): mejor para
  // buscadores, motores de IA y velocidad. En el navegador se refresca sola.
  const locale = lang as Locale
  const property = await fetchProperty(id)
  const t = getDictionary(locale)
  const schemas = property
    ? [
        listingSchema(property, locale, dossierPlainText(dossierHtmlFor(property, locale), 1500) || property.title),
        breadcrumbSchema([
          { name: "B&G Consulting", url: `${SITE_URL}${localizedPath(locale, "home")}` },
          { name: t.nav.opportunities, url: `${SITE_URL}${localizedPath(locale, "opportunities")}` },
          { name: property.title, url: `${SITE_URL}${localizedPath(locale, "opportunities", property.id)}` },
        ]),
      ]
    : []

  return (
    <main className="min-h-screen bg-background">
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      ))}
      <NavBar />
      <PropertyDetail initialData={property} />
      <Footer />
    </main>
  )
}
