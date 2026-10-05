import type { Metadata } from "next"
import { es, type Dictionary } from "./dictionaries/es"
import { en } from "./dictionaries/en"
import {
  defaultLocale,
  locales,
  localizedPath,
  ogLocales,
  SITE_URL,
  type Locale,
  type RouteKey,
} from "./config"

export * from "./config"
export type { Dictionary }

const dictionaries: Record<Locale, Dictionary> = { es, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale]
}

export { format } from "./format"

/**
 * Metadatos de idioma de una pagina: canonical + hreflang para cada idioma.
 * `rest`: segmentos tras la ruta. Un array se usa igual en todos los idiomas
 * (ej. id de propiedad); un objeto permite segmentos distintos por idioma
 * (ej. slug de guia) y limita las alternativas a los idiomas que lo tienen.
 */
export function languageAlternates(
  locale: Locale,
  route: RouteKey,
  rest?: string[] | Partial<Record<Locale, string[]>>,
): Pick<Metadata, "alternates"> & { openGraph: { locale: string; alternateLocale: string[] } } {
  const restByLocale = Array.isArray(rest) ? undefined : rest
  const pathFor = (l: Locale) =>
    localizedPath(l, route, ...(Array.isArray(rest) ? rest : (restByLocale?.[l] ?? [])))
  const available = locales.filter((l) => !restByLocale || restByLocale[l])
  const languages: Record<string, string> = {}
  for (const l of available) languages[l] = `${SITE_URL}${pathFor(l)}`
  if (available.includes(defaultLocale)) languages["x-default"] = `${SITE_URL}${pathFor(defaultLocale)}`

  return {
    alternates: { canonical: `${SITE_URL}${pathFor(locale)}`, languages },
    openGraph: {
      locale: ogLocales[locale],
      alternateLocale: available.filter((l) => l !== locale).map((l) => ogLocales[l]),
    },
  }
}

/**
 * Metadatos completos de una pagina publica: titulo, descripcion,
 * canonical, hreflang y Open Graph coherentes con el idioma.
 */
export function pageMetadata(opts: {
  locale: Locale
  route: RouteKey
  rest?: string[] | Partial<Record<Locale, string[]>>
  title: string
  description: string
  keywords?: string
  type?: "website" | "article"
}): Metadata {
  const { alternates, openGraph } = languageAlternates(opts.locale, opts.route, opts.rest)
  return {
    title: opts.title,
    description: opts.description,
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
    alternates,
    openGraph: {
      type: opts.type ?? "website",
      siteName: "B&G Consulting",
      url: alternates?.canonical as string,
      title: opts.title,
      description: opts.description,
      ...openGraph,
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  }
}
