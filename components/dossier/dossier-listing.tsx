"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { useI18n } from "@/lib/i18n/client"
import { localizedPath } from "@/lib/i18n/config"
import { format } from "@/lib/i18n/format"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { useBrigitte } from "@/components/brigitte/brigitte-provider"
import { DossierFrame } from "./dossier-frame"

/**
 * Ficha de una propiedad cuando tiene dossier: el dossier ES la ficha.
 * Ocupa toda la pantalla (por encima del menu y el pie de la web) con una
 * barra fina de marca: volver al catalogo, idioma y consultar con Brigitte.
 * Brigitte sigue disponible en su burbuja (esta por encima de esta capa).
 */
export function DossierListing({ id, title, html }: { id: string; title: string; html: string }) {
  const { locale, dict } = useI18n()
  const t = dict.property
  const brigitte = useBrigitte()

  // La pagina de debajo no debe desplazarse: el dossier tiene su propio scroll.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[55] flex flex-col bg-noir">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-noir-foreground/10 bg-noir px-4 sm:px-6">
        <Link
          href={localizedPath(locale, "opportunities")}
          className="flex min-w-0 items-center gap-2 text-sm font-light tracking-[0.01em] text-noir-foreground/70 transition-colors hover:text-gold"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M13 8H3M3 8L7 4M3 8L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">{t.back}</span>
        </Link>

        <Link href={localizedPath(locale, "home")} aria-label={dict.nav.homeAria} className="shrink-0">
          <Image src="/brand/logo-bg-consulting-v2.png" alt="B&G Consulting" width={577} height={614} className="h-10 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          <LanguageSwitcher className="hidden sm:flex" />
          <button
            type="button"
            onClick={() => brigitte.open({ property: { id, title } })}
            className="border border-gold/70 px-3 py-1.5 text-[0.82rem] font-light tracking-[0.01em] text-gold transition-colors hover:bg-gold hover:text-noir sm:px-4 sm:text-sm"
          >
            {t.ctaButton}
          </button>
        </div>
      </header>

      <DossierFrame html={html} title={format(t.dossierOf, { title })} className="min-h-0 flex-1" />
    </div>
  )
}
