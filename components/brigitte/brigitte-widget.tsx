"use client"

import { useEffect } from "react"
import { useI18n } from "@/lib/i18n/client"
import { useBrigitte } from "./brigitte-provider"
import { BrigitteAvatar, BrigitteChat } from "./brigitte-chat"

/** Cabecera comun: identidad de Brigitte, con el aviso de asistente virtual siempre visible. */
export function BrigitteHeader({ onClose }: { onClose?: () => void }) {
  const { dict } = useI18n()
  const t = dict.brigitte

  return (
    <div className="flex items-center gap-3 bg-noir px-4 py-3.5">
      <div className="relative">
        <BrigitteAvatar size={38} />
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-noir bg-gold" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-serif text-lg font-light leading-tight text-noir-foreground">{t.name}</p>
        <p className="text-xs font-light text-noir-foreground/60">{t.role}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-noir-foreground/60 transition-colors hover:text-gold"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

/** Burbuja flotante + panel de chat, presente en todas las paginas publicas. */
export function BrigitteWidget() {
  const { dict } = useI18n()
  const t = dict.brigitte
  const { isOpen, open, close } = useBrigitte()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, close])

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={t.name}
          className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-background shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(640px,calc(100vh-3rem))] sm:w-[390px] sm:rounded-xl sm:border sm:border-border"
        >
          <BrigitteHeader onClose={close} />
          <div className="min-h-0 flex-1">
            <BrigitteChat autoFocus />
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => open()}
          aria-label={t.open}
          className="group fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-full border border-gold/40 bg-noir py-2 pl-2 pr-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] transition-colors hover:border-gold sm:bottom-6 sm:right-6 sm:pr-5"
        >
          <span className="relative">
            <BrigitteAvatar size={40} />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-noir bg-gold" aria-hidden="true" />
          </span>
          <span className="hidden flex-col items-start text-left sm:flex">
            <span className="text-[0.82rem] font-light tracking-[0.01em] text-noir-foreground/55">{t.name}</span>
            <span className="text-sm font-light text-noir-foreground transition-colors group-hover:text-gold">
              {t.launcher}
            </span>
          </span>
        </button>
      )}
    </>
  )
}
