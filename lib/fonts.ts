import { Jost, Cormorant_Garamond } from "next/font/google"

/** Fuentes de marca, compartidas por todos los layouts raiz. */
export const jost = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
})

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600", "700"],
})
