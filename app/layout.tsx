import type { Metadata } from "next"
import { Jost, Cormorant_Garamond } from "next/font/google"
import "./globals.css"

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://bgestateconsulting.com"),
  title: {
    default: "B&G Consulting — Inversiones inmobiliarias de lujo",
    template: "%s — B&G Consulting",
  },
  applicationName: "B&G Consulting",
  description:
    "Accede a una selección exclusiva de activos inmobiliarios de alto valor en Europa, Latinoamérica y Dubái. Cada oportunidad analizada y validada por nuestro equipo de asesores.",
  keywords:
    "B&G Consulting, inversiones inmobiliarias de lujo, propiedades premium, invertir en inmuebles, oportunidades inmobiliarias internacionales, real estate investment",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "B&G Consulting",
    url: "https://bgestateconsulting.com",
    title: "B&G Consulting — Inversiones inmobiliarias de lujo",
    description:
      "Selección exclusiva de activos inmobiliarios de alto valor en Europa, Latinoamérica y Dubái, analizados con criterio profesional.",
  },
  twitter: {
    card: "summary_large_image",
    title: "B&G Consulting — Inversiones inmobiliarias de lujo",
    description:
      "Selección exclusiva de activos inmobiliarios de alto valor en Europa, Latinoamérica y Dubái, analizados con criterio profesional.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="bg-background">
      <body className={`${jost.variable} ${cormorant.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
