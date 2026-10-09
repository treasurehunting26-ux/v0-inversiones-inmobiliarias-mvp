import Link from "next/link"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { PropertyCard } from "@/components/catalogo/property-card"
import { PropertyRow } from "@/components/catalogo/property-row"
import { getDictionary, type Locale } from "@/lib/i18n"
import { localizedPath } from "@/lib/i18n/config"
import { getPublishedProperties, type Property } from "@/lib/properties-api"
import { CATEGORIES, CATEGORY_SLUGS, isCategory, type Category } from "@/lib/categories"

/**
 * Catálogo ordenado por categoría de inversión.
 * - Sin categoría activa: una sección por categoría (Prime primero, con
 *   fichas grandes; el resto en filas con los datos por delante).
 * - Con categoría activa (/oportunidades/reforma…): solo esa categoría.
 */
export async function OpportunitiesView({ locale, active }: { locale: Locale; active: Category | null }) {
  const t = getDictionary(locale).opportunities
  const properties = await getPublishedProperties()

  const byCategory = (c: Category) => properties.filter((p) => p.category === c)
  const unclassified = properties.filter((p) => !isCategory(p.category))
  const header = active ? t.categories[active] : null
  const categoryHref = (c: Category) => localizedPath(locale, "opportunities", CATEGORY_SLUGS[locale][c])

  const sections = active
    ? [{ key: active, items: byCategory(active) }]
    : [
        ...CATEGORIES.map((c) => ({ key: c as Category | "other", items: byCategory(c) })),
        { key: "other" as const, items: unclassified },
      ].filter((s) => s.items.length > 0)

  return (
    <main className="min-h-screen bg-background">
      <NavBar />

      <section className="relative overflow-hidden bg-noir px-6 pb-20 pt-40">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <span className="text-sm text-gold">{header ? t.title : t.eyebrow}</span>
          <h1 className="max-w-3xl font-serif text-5xl font-normal leading-[1.05] text-balance text-noir-foreground md:text-6xl">
            {header ? header.title : t.title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-noir-foreground/75">{header ? header.intro : t.intro}</p>
          <p className="mt-6 max-w-2xl border-t border-noir-foreground/15 pt-8 text-sm leading-relaxed text-noir-foreground/55">
            {t.disclaimer}
          </p>
        </div>
      </section>

      {/* Navegación por categorías */}
      <nav aria-label={t.categoriesLabel} className="border-b border-border bg-background">
        <ul className="mx-auto flex max-w-6xl gap-8 overflow-x-auto px-6 text-sm">
          <li>
            <NavLink href={localizedPath(locale, "opportunities")} current={!active}>
              {t.all}
            </NavLink>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c}>
              <NavLink href={categoryHref(c)} current={active === c}>
                {t.categories[c].label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-20">
        {sections.length === 0 || sections.every((s) => s.items.length === 0) ? (
          <Empty locale={locale} title={t.emptyTitle} body={t.emptyBody} cta={t.leaveProfile} />
        ) : (
          <div className="flex flex-col gap-24">
            {sections.map(({ key, items }) => (
              <section key={key} aria-labelledby={`cat-${key}`}>
                {!active && (
                  <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex max-w-2xl flex-col gap-3">
                      <h2 id={`cat-${key}`} className="font-serif text-3xl font-normal text-foreground md:text-4xl">
                        {key === "other" ? t.other : t.categories[key].title}
                      </h2>
                      {key !== "other" && <p className="text-muted-foreground">{t.categories[key].intro}</p>}
                    </div>
                    {key !== "other" && (
                      <Link href={categoryHref(key)} className="shrink-0 text-sm text-copper-ink underline-offset-4 hover:underline">
                        {t.categories[key].label} ({items.length})
                      </Link>
                    )}
                  </div>
                )}
                {active && <h2 id={`cat-${key}`} className="sr-only">{t.categories[key as Category].title}</h2>}
                <Listing items={items} large={key === "prime"} />
              </section>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}

function Listing({ items, large }: { items: Property[]; large: boolean }) {
  if (large) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    )
  }
  return (
    <div className="border-t border-border">
      {items.map((p) => (
        <PropertyRow key={p.id} property={p} />
      ))}
    </div>
  )
}

function NavLink({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`block whitespace-nowrap border-b-2 py-5 transition-colors ${
        current ? "border-copper text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  )
}

function Empty({ locale, title, body, cta }: { locale: Locale; title: string; body: string; cta: string }) {
  return (
    <div className="flex flex-col items-center gap-4 border border-border bg-card px-6 py-20 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{body}</p>
      <Link
        href={localizedPath(locale, "assistant")}
        className="mt-2 inline-flex items-center bg-primary px-6 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
      >
        {cta}
      </Link>
    </div>
  )
}
