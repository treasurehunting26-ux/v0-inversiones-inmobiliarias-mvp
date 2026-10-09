/**
 * Datos estructurados (schema.org) para buscadores y motores de IA.
 * Google, ChatGPT, Perplexity o Gemini leen este JSON-LD para entender
 * quién es la empresa, qué hay en cada página y qué datos tiene cada activo.
 */
import type { Locale } from "@/lib/i18n"
import { SITE_URL, localizedPath } from "@/lib/i18n/config"
import type { Property } from "@/lib/properties-api"

/** JSON seguro para incrustar en <script> (evita cerrar la etiqueta). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

export const ORG_ID = `${SITE_URL}/#organization`

export function organizationSchema(locale: Locale, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": ORG_ID,
    name: "B&G Consulting",
    url: `${SITE_URL}${localizedPath(locale, "home")}`,
    logo: `${SITE_URL}/brand/logo-bg-consulting-v2.png`,
    image: `${SITE_URL}/opengraph-image.png`,
    description,
    address: { "@type": "PostalAddress", addressLocality: "Marbella", addressRegion: "Málaga", addressCountry: "ES" },
    areaServed: ["Marbella", "Costa del Sol", "España", "Latinoamérica", "Dubái"],
    knowsLanguage: ["es", "en"],
  }
}

export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "B&G Consulting",
    url: SITE_URL,
    inLanguage: locale,
    publisher: { "@id": ORG_ID },
  }
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/** Texto plano legible de un dossier HTML (sin estilos, scripts ni etiquetas). */
export function dossierPlainText(html: string | null | undefined, maxChars = 1200): string {
  if (!html) return ""
  const text = html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/i, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|h[1-6]|li|div|section)>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .replace(/(\s*\.\s*){2,}/g, ". ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim()
  if (text.length <= maxChars) return text
  const cut = text.slice(0, maxChars)
  return cut.slice(0, cut.lastIndexOf(" ")) + "…"
}

/**
 * Primer párrafo descriptivo del dossier (el primero con texto de verdad,
 * saltando portada, fichas de datos y etiquetas). Para la meta descripción.
 */
export function dossierLead(html: string | null | undefined, maxChars = 160): string {
  if (!html) return ""
  const body = html.replace(/<(script|style|noscript|svg|template|head)[\s\S]*?<\/\1>/gi, " ")
  for (const m of body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = dossierPlainText(m[1], 100000).replace(/^[—–\-·]\s*/, "")
    if (text.length >= 80 && /[a-záéíóúñ]{4,}\s+[a-záéíóúñ]{2,}/i.test(text)) {
      return text.length <= maxChars ? text : text.slice(0, text.slice(0, maxChars).lastIndexOf(" ")) + "…"
    }
  }
  return dossierPlainText(html, maxChars)
}

/** Precio numérico en euros si el rango es una cifra concreta ("4.900.000 €"); si no, null. */
export function priceFromRange(range: string | null | undefined): number | null {
  if (!range || !/€|eur/i.test(range) || /[-–]|desde|from|hasta|to /i.test(range)) return null
  const digits = range.replace(/[^\d]/g, "")
  const n = Number(digits)
  return digits.length >= 5 && Number.isFinite(n) ? n : null
}

/** Ficha de un inmueble para buscadores y motores de IA. */
export function listingSchema(property: Property, locale: Locale, description: string) {
  const url = `${SITE_URL}${localizedPath(locale, "opportunities", property.id)}`
  const price = priceFromRange(property.investment_range)
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    url,
    description,
    inLanguage: locale,
    image: (property.photos ?? []).slice(0, 6),
    about: {
      "@type": "Place",
      name: property.title,
      address: { "@type": "PostalAddress", addressLocality: property.location },
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: locale === "en" ? "Asset type" : "Tipo de activo", value: property.asset_type },
      property.horizon
        ? { "@type": "PropertyValue", name: locale === "en" ? "Horizon" : "Horizonte", value: property.horizon }
        : null,
    ].filter(Boolean),
    offers: {
      "@type": "Offer",
      ...(price ? { price, priceCurrency: "EUR" } : { description: property.investment_range }),
      availability: "https://schema.org/InStock",
      seller: { "@id": ORG_ID },
    },
    provider: { "@id": ORG_ID },
  }
}
