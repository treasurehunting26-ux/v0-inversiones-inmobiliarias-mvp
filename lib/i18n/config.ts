/**
 * Configuracion de idiomas de la web publica.
 *
 * PARA ANADIR UN IDIOMA NUEVO (ej. frances):
 * 1. Anadir "fr" a `locales` y su etiqueta en `localeLabels`/`ogLocales`.
 * 2. Anadir la traduccion de cada ruta en `routeSlugs` (ej. contact: "contact").
 * 3. Crear lib/i18n/dictionaries/fr.ts (TypeScript avisa de cada texto que falte).
 * 4. Crear lib/guides/fr.ts con las guias traducidas (mismo `id`, slug propio).
 * Nada mas: el proxy, los enlaces, el selector de idioma, el sitemap y
 * las etiquetas hreflang se generan solos a partir de esta configuracion.
 *
 * El espanol es el idioma por defecto y NO lleva prefijo (/oportunidades),
 * para conservar las URLs ya indexadas. El resto lleva prefijo (/en/opportunities).
 */

export const locales = ["es", "en"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "es"

export const localeLabels: Record<Locale, string> = {
  es: "Español",
  en: "English",
}

export const ogLocales: Record<Locale, string> = {
  es: "es_ES",
  en: "en_GB",
}

/** Claves internas de ruta = nombre de la carpeta en app/(site)/[lang]/ */
export type RouteKey = "home" | "opportunities" | "guides" | "contact" | "assistant"

/** Segmento visible en la URL para cada ruta e idioma. */
export const routeSlugs: Record<Exclude<RouteKey, "home">, Record<Locale, string>> = {
  opportunities: { es: "oportunidades", en: "opportunities" },
  guides: { es: "guias", en: "guides" },
  contact: { es: "contacto", en: "contact" },
  assistant: { es: "asistente", en: "assistant" },
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bgestateconsulting.com").replace(/\/$/, "")

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}

/**
 * Construye la URL publica de una ruta en un idioma.
 *   localizedPath("es", "opportunities", "123") -> "/oportunidades/123"
 *   localizedPath("en", "opportunities", "123") -> "/en/opportunities/123"
 *   localizedPath("en", "home")                 -> "/en"
 */
export function localizedPath(locale: Locale, route: RouteKey, ...rest: string[]): string {
  const prefix = locale === defaultLocale ? "" : `/${locale}`
  const segments = route === "home" ? [] : [routeSlugs[route][locale]]
  const path = [...segments, ...rest.filter(Boolean).map(encodeURIComponent)].join("/")
  if (!path) return prefix || "/"
  return `${prefix}/${path}`
}

/** Ancla dentro de la home (ej. "#como-funciona") respetando el idioma. */
export function homeAnchor(locale: Locale, anchor: string): string {
  const base = localizedPath(locale, "home")
  return `${base === "/" ? "" : base}/#${anchor}`
}

export type ParsedPath = {
  locale: Locale
  route: RouteKey | null // null = segmento desconocido
  rest: string[]
}

/** Interpreta una URL publica: idioma, ruta interna y resto de segmentos. */
export function parsePublicPath(pathname: string): ParsedPath {
  const segments = pathname.split("/").filter(Boolean).map((s) => decodeURIComponent(s))
  let locale: Locale = defaultLocale
  if (isLocale(segments[0]) && segments[0] !== defaultLocale) {
    locale = segments.shift() as Locale
  }
  if (segments.length === 0) return { locale, route: "home", rest: [] }

  const [first, ...rest] = segments
  const match = (Object.keys(routeSlugs) as Exclude<RouteKey, "home">[]).find(
    (key) => routeSlugs[key][locale] === first,
  )
  return { locale, route: match ?? null, rest }
}
