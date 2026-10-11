/**
 * /llms.txt: resumen de la web para motores de IA (ChatGPT, Claude,
 * Perplexity, Gemini). Formato estándar llmstxt.org: quiénes somos y enlaces
 * a las páginas clave, con las propiedades publicadas al día.
 */
import { getDictionary } from "@/lib/i18n"
import { SITE_URL, localizedPath } from "@/lib/i18n/config"
import { getGuides } from "@/lib/guides"
import { getPublishedProperties } from "@/lib/properties-api"
import { CATEGORIES, categoryPathRest } from "@/lib/categories"

export const revalidate = 3600

export async function GET() {
  const es = getDictionary("es")
  const en = getDictionary("en")
  const properties = await getPublishedProperties()
  const url = (path: string) => `${SITE_URL}${path}`

  const lines: string[] = [
    "# B&G Consulting",
    "",
    `> ${es.meta.description}`,
    "",
    "B&G Consulting es una asesoría de inversión inmobiliaria con sede en Marbella (España). Selecciona y valida uno a uno activos residenciales de lujo, oportunidades para reformar, proyectos y suelos, y activos comerciales e industriales en España, Latinoamérica y Dubái. Cada activo tiene un dossier privado y un asesor dedicado. Web en español e inglés.",
    "",
    "## Categorías de inversión",
    ...CATEGORIES.map((c) => {
      const cat = es.opportunities.categories[c]
      return `- [${cat.title}](${url(localizedPath("es", "opportunities", ...categoryPathRest("es", c)))}): ${cat.intro}`
    }),
    "",
    "## Propiedades publicadas",
    ...(properties.length
      ? properties
          .filter((p) => p.category)
          .map(
            (p) =>
              `- [${p.title}](${url(localizedPath("es", "opportunities", p.id))}): ${[p.asset_type, p.location, p.investment_range]
                .filter(Boolean)
                .join(", ")}`,
          )
      : ["- Catálogo en actualización."]),
    "",
    "## Guías de inversión",
    ...getGuides("es").map((g) => `- [${g.title}](${url(localizedPath("es", "guides", g.slug))}): ${g.metaDescription}`),
    "",
    "## English",
    `- [Home](${url(localizedPath("en", "home"))}): ${en.meta.description}`,
    ...CATEGORIES.map((c) => {
      const cat = en.opportunities.categories[c]
      return `- [${cat.title}](${url(localizedPath("en", "opportunities", ...categoryPathRest("en", c)))}): ${cat.intro}`
    }),
    ...getGuides("en").map((g) => `- [${g.title}](${url(localizedPath("en", "guides", g.slug))}): ${g.metaDescription}`),
    "",
    "## Contacto",
    `- [Hablar con un asesor](${url(localizedPath("es", "contact"))})`,
    `- [Asistente virtual Brigitte](${url(localizedPath("es", "assistant"))})`,
    "",
  ]

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
