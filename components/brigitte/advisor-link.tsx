"use client"

import type { MouseEvent, ReactNode } from "react"
import { useI18n } from "@/lib/i18n/client"
import { localizedPath } from "@/lib/i18n/config"
import { useBrigitte } from "./brigitte-provider"

/**
 * Botón "Hablar con un asesor": abre el panel de Brigitte en la misma página.
 * Es un enlace real a /asistente, así que funciona sin JavaScript, con
 * Cmd/Ctrl+clic (nueva pestaña) y para buscadores.
 */
export function AdvisorLink({ className, children }: { className?: string; children: ReactNode }) {
  const { locale } = useI18n()
  const { open } = useBrigitte()

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    open()
  }

  return (
    <a href={localizedPath(locale, "assistant")} onClick={onClick} className={className}>
      {children}
    </a>
  )
}
