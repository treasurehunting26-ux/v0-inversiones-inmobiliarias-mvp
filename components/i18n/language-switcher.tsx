"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "@/lib/i18n/client"
import { locales, localizedPath, parsePublicPath, type Locale } from "@/lib/i18n/config"
import { translateGuideSlug } from "@/lib/guides/slugs"
import { CATEGORY_SLUGS, categoryFromSlug } from "@/lib/categories"

/** Misma pagina en otro idioma (las guias tienen slug propio por idioma). */
function pathInLocale(pathname: string, target: Locale): string {
  const { locale, route, rest } = parsePublicPath(pathname)
  if (!route) return localizedPath(target, "home")
  if (route === "guides" && rest[0]) {
    const slug = translateGuideSlug(rest[0], locale, target)
    return slug ? localizedPath(target, "guides", slug) : localizedPath(target, "guides")
  }
  if (route === "opportunities" && rest[0]) {
    const category = categoryFromSlug(locale, rest[0])
    if (category) return localizedPath(target, "opportunities", CATEGORY_SLUGS[target][category])
  }
  return localizedPath(target, route, ...rest)
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/"
  const { locale, dict } = useI18n()

  return (
    <nav aria-label={dict.nav.language} className={`flex items-center gap-2 ${className}`}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span className="text-noir-foreground/30" aria-hidden="true">·</span>}
          {l === locale ? (
            <span aria-current="true" className="text-xs font-light uppercase tracking-[0.18em] text-gold">
              {l}
            </span>
          ) : (
            <Link
              href={pathInLocale(pathname, l)}
              hrefLang={l}
              lang={l}
              className="text-xs font-light uppercase tracking-[0.18em] text-noir-foreground/60 transition-colors hover:text-gold"
            >
              {l}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
