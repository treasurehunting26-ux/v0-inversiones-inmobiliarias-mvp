"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { useI18n } from "@/lib/i18n/client"
import { localizedPath } from "@/lib/i18n/config"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { propertyFetcher } from "@/lib/properties-api"
import { useBrigitte } from "./brigitte-provider"
import { BrigitteChat } from "./brigitte-chat"
import { BrigitteHeader } from "./brigitte-widget"

/** Brigitte a pantalla completa (pagina /asistente): oculta la burbuja flotante. */
export function BrigittePage() {
  const { locale, dict } = useI18n()
  const { setEmbedded, close, focus } = useBrigitte()

  useEffect(() => {
    setEmbedded(true)
    close()
    return () => setEmbedded(false)
  }, [setEmbedded, close])

  // Enlace con propiedad (ej. desde un dossier: /asistente?propiedad=<id>)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("propiedad") || params.get("property")
    if (!id) return
    propertyFetcher(`/properties/${encodeURIComponent(id)}`)
      .then((p) => focus({ id: p.id, title: p.title }))
      .catch(() => {
        // Propiedad no publicada o inexistente: se conversa sin contexto.
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-noir-foreground/10 bg-noir px-5 py-3">
        <Link
          href={localizedPath(locale, "home")}
          className="flex items-center gap-2 text-sm font-medium tracking-[0.01em] text-noir-foreground/60 transition-colors hover:text-gold"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {dict.assistantPage.back}
        </Link>
        <Link href={localizedPath(locale, "home")} aria-label={dict.nav.homeAria}>
          <Image src="/brand/logo-bg-consulting-v2.png" alt="B&G Consulting" width={577} height={614} className="h-14 w-auto" />
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="flex min-h-0 flex-1 justify-center">
        <div className="flex min-h-0 w-full max-w-2xl flex-col border-x border-border">
          <BrigitteHeader />
          <div className="min-h-0 flex-1">
            <BrigitteChat autoFocus />
          </div>
        </div>
      </main>
    </div>
  )
}
