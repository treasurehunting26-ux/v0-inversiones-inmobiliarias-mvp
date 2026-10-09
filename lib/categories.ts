/**
 * Categorías de inversión de las propiedades.
 * Solo "prime" aparece en la portada; el resto se ordena en el catálogo.
 * Las claves coinciden con el backend (columna properties.category).
 */
export const CATEGORIES = ["prime", "value_add", "development", "commercial"] as const

export type Category = (typeof CATEGORIES)[number]

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value)
}

/** Etiquetas para el panel admin. */
export const CATEGORY_ADMIN_LABELS: Record<Category, string> = {
  prime: "Residencial (sale en la portada)",
  value_add: "Oportunidades de valor (reforma)",
  development: "Proyectos y desarrollo",
  commercial: "Comercial e industrial",
}

/** Segmento de URL de cada categoría, por idioma. */
export const CATEGORY_SLUGS: Record<"es" | "en", Record<Category, string>> = {
  es: { prime: "residencial", value_add: "reforma", development: "proyectos", commercial: "comercial" },
  en: { prime: "residential", value_add: "value-add", development: "development", commercial: "commercial" },
}

export function categoryFromSlug(locale: "es" | "en", slug: string): Category | null {
  const entry = Object.entries(CATEGORY_SLUGS[locale]).find(([, s]) => s === slug)
  return entry ? (entry[0] as Category) : null
}

/**
 * Ruta pública de una categoría. Residencial es la página principal del
 * catálogo (/oportunidades); el resto cuelga de ella (/oportunidades/reforma).
 */
export function categoryPathRest(locale: "es" | "en", category: Category): string[] {
  return category === "prime" ? [] : [CATEGORY_SLUGS[locale][category]]
}
