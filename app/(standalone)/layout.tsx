import type { Metadata } from "next"
import type { ReactNode } from "react"
import { jost, cormorant } from "@/lib/fonts"
import { SITE_URL } from "@/lib/i18n/config"
import "../globals.css"

/**
 * Layout raiz de las paginas que no forman parte de la web publica
 * multiidioma: panel /admin y dossiers privados (/dossier/...).
 * Siguen en espanol y no se indexan.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "B&G Consulting",
    template: "%s — B&G Consulting",
  },
  applicationName: "B&G Consulting",
  robots: { index: false, follow: false },
}

export default function StandaloneRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="bg-background">
      <body className={`${jost.variable} ${cormorant.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
