"use client"

/**
 * Muestra un dossier HTML completo tal cual fue diseñado.
 *
 * Seguridad del sandbox:
 * - allow-scripts: las animaciones, galerias y efectos del dossier funcionan.
 * - SIN allow-same-origin: el dossier se ejecuta en un origen aislado y no
 *   puede leer cookies, sesion del panel ni datos de la web principal.
 *   (allow-scripts + allow-same-origin juntos anularian el aislamiento.)
 * - allow-popups / allow-top-navigation-by-user-activation: los enlaces del
 *   dossier (WhatsApp, email, web) se abren cuando el visitante los pulsa.
 */
export const DOSSIER_SANDBOX =
  "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-forms"

export function DossierFrame({
  html,
  title,
  className = "",
}: {
  html: string
  title: string
  className?: string
}) {
  return (
    <iframe
      srcDoc={html}
      title={title}
      sandbox={DOSSIER_SANDBOX}
      referrerPolicy="no-referrer"
      className={`block w-full border-0 bg-white ${className}`}
    />
  )
}
