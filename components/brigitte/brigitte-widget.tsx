"use client"

import { useEffect } from "react"
import { useI18n } from "@/lib/i18n/client"
import { useBrigitte } from "./brigitte-provider"
import { BrigitteAvatar } from "./brigitte-chat"
import { PrivateEnquiry } from "./private-enquiry"

/** Cabecera: identidad de asesora, con el aviso de IA siempre visible. */
export function BrigitteHeader({ onClose }: { onClose?: () => void }) {
  const { dict } = useI18n()
  const t = dict.brigitte

  return (
    <div className="bg-noir px-6 pb-5 pt-6">
      <div className="flex items-start gap-4">
        <BrigitteAvatar size={52} />
        <div className="min-w-0 flex-1 pt-1">
          <p className="font-serif text-2xl leading-tight text-noir-foreground">{t.name}</p>
          <p className="mt-1 text-sm text-gold-soft">{t.role}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center text-noir-foreground/60 transition-colors hover:text-gold"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-4 border-t border-noir-foreground/10 pt-3 text-[0.82rem] leading-snug text-noir-foreground/55">
        {t.aiNotice}
      </p>
    </div>
  )
}

/** Cabecera de la asesoría privada: la firma, sin asistente. */
function EnquiryHeader({ onClose }: { onClose: () => void }) {
  const { dict } = useI18n()
  const t = dict.enquiry

  return (
    <div className="bg-noir px-6 pb-6 pt-7 sm:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gold-soft">B&amp;G Consulting</p>
          <p className="mt-1 font-serif text-3xl leading-tight text-noir-foreground">{t.title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center text-noir-foreground/60 transition-colors hover:text-gold"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-noir-foreground/70">{t.intro}</p>
    </div>
  )
}

/**
 * Panel lateral "Hablar con un asesor": solicitud privada. No hay burbuja flotante: se abre desde los
 * botones "Hablar con un asesor" de la web (y desde las fichas).
 */
export function BrigitteWidget() {
  const { dict } = useI18n()
  const t = dict.brigitte
  const { isOpen, close } = useBrigitte()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Fondo: clic fuera para cerrar */}
      <button
        type="button"
        aria-label={t.close}
        onClick={close}
        className="bg-fade-in absolute inset-0 hidden cursor-default bg-noir/40 backdrop-blur-[2px] sm:block"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dict.enquiry.title}
        className="bg-slide-in absolute inset-y-0 right-0 flex w-full flex-col overflow-hidden bg-background shadow-[-30px_0_80px_-30px_rgba(0,0,0,0.45)] sm:w-[460px]"
      >
        <EnquiryHeader onClose={close} />
        <div className="min-h-0 flex-1">
          <PrivateEnquiry />
        </div>
      </div>
    </div>
  )
}
