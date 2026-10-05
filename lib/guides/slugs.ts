import type { Locale } from "@/lib/i18n/config"

/**
 * URL de cada guia en cada idioma. Es la unica fuente de verdad de los
 * slugs: el contenido (lib/guides/<idioma>.ts), el selector de idioma,
 * el sitemap y las etiquetas hreflang leen de aqui.
 */
export const guideSlugs = {
  marbella: {
    es: "invertir-inmuebles-marbella-costa-del-sol",
    en: "invest-property-marbella-costa-del-sol",
  },
  dubai: {
    es: "invertir-inmuebles-dubai-guia-inversor",
    en: "invest-property-dubai-investor-guide",
  },
  "market-comparison": {
    es: "comparativa-mercados-europa-latam-dubai",
    en: "compare-property-markets-europe-latam-dubai",
  },
  faq: {
    es: "preguntas-frecuentes-inversion-inmobiliaria",
    en: "international-property-investment-faq",
  },
} satisfies Record<string, Record<Locale, string>>

export type GuideId = keyof typeof guideSlugs

/** Traduce el slug de una guia de un idioma a otro (null si no existe). */
export function translateGuideSlug(slug: string, from: Locale, to: Locale): string | null {
  const id = (Object.keys(guideSlugs) as GuideId[]).find((g) => guideSlugs[g][from] === slug)
  return id ? guideSlugs[id][to] : null
}
