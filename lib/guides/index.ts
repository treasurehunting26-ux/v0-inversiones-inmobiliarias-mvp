import type { Locale } from "@/lib/i18n/config"
import { guidesEs } from "./es"
import { guidesEn } from "./en"
import { guideSlugs, type GuideId } from "./slugs"
import type { Guide } from "./types"

export * from "./types"
export { guideSlugs, translateGuideSlug, type GuideId } from "./slugs"

/** Guias de cada idioma. Un idioma nuevo solo necesita su archivo aqui. */
const guidesByLocale: Record<Locale, Guide[]> = {
  es: guidesEs,
  en: guidesEn,
}

export function getGuides(locale: Locale): Guide[] {
  return guidesByLocale[locale]
}

export function getGuide(locale: Locale, slug: string): Guide | undefined {
  return guidesByLocale[locale].find((g) => g.slug === slug)
}

/** Slug de la misma guia en cada idioma en el que existe (para hreflang). */
export function getGuideSlugsById(id: GuideId): Partial<Record<Locale, string[]>> {
  const result: Partial<Record<Locale, string[]>> = {}
  for (const [locale, guides] of Object.entries(guidesByLocale) as [Locale, Guide[]][]) {
    if (guides.some((g) => g.id === id)) result[locale] = [guideSlugs[id][locale]]
  }
  return result
}
