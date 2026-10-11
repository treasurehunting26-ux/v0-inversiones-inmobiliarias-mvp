import Link from "next/link"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { PropertyCard } from "@/components/catalogo/property-card"
import { PropertyRow } from "@/components/catalogo/property-row"
import { getDictionary, type Locale } from "@/lib/i18n"
import { SITE_URL, localizedPath } from "@/lib/i18n/config"
import { ORG_ID, breadcrumbSchema, jsonLd } from "@/lib/seo"
import { getPublishedProperties } from "@/lib/properties-api"
import { CATEGORIES, categoryPathRest, type Category } from "@/lib/categories"

/**
 * Catálogo: una categoría por página, con menú para cambiar entre ellas.
 * - Residencial (/oportunidades): fichas grandes con foto.
 * - Reforma, proyectos y comercial (/oportunidades/reforma…): filas con los
 *   datos por delante.
 * Las propiedades sin categoría no se muestran.
 */
export async function OpportunitiesView({ locale, active }: { locale: Locale; active: Category }) {
  const t = getDictionary(locale).opportunities
  const items = (await getPublishedProperties()).filter((p) => p.category === active)
  const header = t.categories[active]
  const pageUrl = `${SITE_URL}${localizedPath(locale, "opportunities", ...categoryPathRest(locale, active))}`
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: header.title,
      description: header.metaDescription,
      url: pageUrl,
      inLanguage: locale,
      publisher: { "@id": ORG_ID },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: items.length,
        itemListElement: items.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.title,
          url: `${SITE_URL}${localizedPath(locale, "opportunities", p.id)}`,
        })),
      },
    },
    breadcrumbSchema([
      { name: "B&G Consulting", url: `${SITE_URL}${localizedPath(locale, "home")}` },
      { name: getDictionary(locale).nav.opportunities, url: `${SITE_URL}${localizedPath(locale, "opportunities")}` },
      ...(active === "prime" ? [] : [{ name: header.title, url: pageUrl }]),
    ]),
  ]

  return (
    <main className="min-h-screen bg-background">
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      ))}
      <NavBar />

      <section className="relative overflow-hidden bg-noir px-6 pb-16 pt-40">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <span className="text-sm text-gold">{t.eyebrow}</span>
          <h1 className="max-w-3xl font-serif text-5xl font-normal leading-[1.05] text-balance text-noir-foreground md:text-6xl">
            {header.title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-noir-foreground/75">{header.intro}</p>
        </div>
      </section>

      {/* Menú de categorías: queda fijo bajo la barra superior al bajar */}
      <nav aria-label={t.categoriesLabel} className="sticky top-24 z-40 border-b border-border bg-background/95 backdrop-blur lg:top-28">
        <ul className="mx-auto flex max-w-6xl gap-8 overflow-x-auto px-6 text-sm">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <Link
                href={localizedPath(locale, "opportunities", ...categoryPathRest(locale, c))}
                aria-current={active === c ? "page" : undefined}
                className={`block whitespace-nowrap border-b-2 py-5 transition-colors ${
                  active === c ? "border-copper text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.categories[c].label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border border-border bg-card px-6 py-20 text-center">
            <p className="text-base font-semibold text-foreground">{t.emptyTitle}</p>
            <p className="max-w-md text-sm text-muted-foreground">{t.emptyBody}</p>
            <Link
              href={localizedPath(locale, "assistant")}
              className="mt-2 inline-flex items-center bg-primary px-6 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t.leaveProfile}
            </Link>
          </div>
        ) : active === "prime" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="border-t border-border">
            {items.map((p) => (
              <PropertyRow key={p.id} property={p} />
            ))}
          </div>
        )}

        {/* Texto explicativo de la categoría: útil para el inversor y citable por buscadores e IA */}
        <section className="mt-24 grid gap-10 border-t border-border pt-16 md:grid-cols-[1fr_1.4fr]">
          <h2 className="font-serif text-3xl font-normal leading-tight text-foreground">{header.aboutTitle}</h2>
          <div className="flex flex-col gap-5 leading-relaxed text-muted-foreground">
            {header.about.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </section>

        <p className="mt-16 max-w-2xl border-t border-border pt-8 text-sm leading-relaxed text-muted-foreground">
          {t.disclaimer}
        </p>
      </div>

      <Footer />
    </main>
  )
}
