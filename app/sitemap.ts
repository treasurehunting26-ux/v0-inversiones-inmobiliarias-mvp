import type { MetadataRoute } from "next"
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/categories"
import { guideSlugs, getGuides, type GuideId } from "@/lib/guides"
import { defaultLocale, locales, localizedPath, SITE_URL, type Locale, type RouteKey } from "@/lib/i18n/config"

type Freq = MetadataRoute.Sitemap[number]["changeFrequency"]

/** Una entrada por idioma, cada una con sus alternativas hreflang. */
function entries(
  route: RouteKey,
  restFor: (l: Locale) => string[] | null,
  changeFrequency: Freq,
  priority: number,
): MetadataRoute.Sitemap {
  const available = locales.filter((l) => restFor(l) !== null)
  const urlFor = (l: Locale) => `${SITE_URL}${localizedPath(l, route, ...(restFor(l) ?? []))}`
  const languages = Object.fromEntries(available.map((l) => [l, urlFor(l)]))
  if (available.includes(defaultLocale)) languages["x-default"] = urlFor(defaultLocale)

  return available.map((l) => ({
    url: urlFor(l),
    changeFrequency,
    priority,
    alternates: { languages },
  }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const always = () => []
  const guideIds = Object.keys(guideSlugs) as GuideId[]

  return [
    ...entries("home", always, "weekly", 1),
    ...entries("opportunities", always, "daily", 0.9),
    ...CATEGORIES.flatMap((c) => entries("opportunities", (l) => [CATEGORY_SLUGS[l][c]], "daily", 0.85)),
    ...entries("guides", always, "weekly", 0.8),
    ...entries("assistant", always, "monthly", 0.7),
    ...entries("contact", always, "monthly", 0.6),
    ...guideIds.flatMap((id) =>
      entries(
        "guides",
        (l) => (getGuides(l).some((g) => g.id === id) ? [guideSlugs[id][l]] : null),
        "monthly",
        0.6,
      ),
    ),
  ]
}
