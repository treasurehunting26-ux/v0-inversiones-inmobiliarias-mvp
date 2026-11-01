import type { ReactNode } from "react"
import { whatsappLink } from "@/lib/enquiry"

/** Icono de WhatsApp (marca). */
export function WhatsAppIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z" />
    </svg>
  )
}

/**
 * Enlace al WhatsApp único de la firma. El número no se muestra en la web:
 * el visitante pulsa y se abre la conversación.
 */
export function WhatsAppLink({
  message = "",
  className,
  label,
  children,
}: {
  message?: string
  className?: string
  label: string
  children: ReactNode
}) {
  return (
    <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>
      {children}
    </a>
  )
}
