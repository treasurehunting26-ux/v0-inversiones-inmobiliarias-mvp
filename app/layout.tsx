import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })

export const metadata: Metadata = {
  title: "Inversiones Inmobiliarias — Oportunidades analizadas con criterio profesional",
  description:
    "Accede a oportunidades inmobiliarias validadas por expertos. Nuestro asistente inteligente te ayuda a encontrar la inversión adecuada a tu perfil.",
  keywords: "inversiones inmobiliarias, oportunidades inmobiliarias, invertir en inmuebles, rentabilidad inmobiliaria",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
