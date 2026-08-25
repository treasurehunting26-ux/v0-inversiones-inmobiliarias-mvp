import type { ReactNode } from "react"
import { Fraunces, IBM_Plex_Mono, Work_Sans } from "next/font/google"
import "./dossier.css"

/**
 * El dossier es un documento privado autocontenido (se comparte por
 * WhatsApp/email), distinto de la app principal: usa su propio sistema
 * tipografico editorial (serif italica + sans + mono para etiquetas) y su
 * propia paleta (papel, tinta, laton), escondos en esta capa para no afectar
 * las 2 fuentes de marca del resto del sitio.
 */

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-dossier-serif",
})

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dossier-sans",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dossier-mono",
})

export default function DossierLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${fraunces.variable} ${workSans.variable} ${plexMono.variable} dossier`}>
      {children}
    </div>
  )
}
