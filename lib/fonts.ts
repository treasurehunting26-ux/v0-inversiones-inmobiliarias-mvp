import { Bodoni_Moda, Inter_Tight } from "next/font/google"

/**
 * Fuentes de marca, compartidas por todos los layouts raiz.
 * - Bodoni Moda: titulares (alto contraste, registro de lujo). Solo en
 *   tamaños grandes: sus trazos finos se pierden por debajo de ~24 px.
 * - Inter Tight: textos, botones, datos y cifras.
 * Se mantienen los nombres de variable (--font-sans / --font-serif).
 */
export const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  // Sin 300: los textos "font-light" se ven en 400, más legibles en pantalla
  weight: ["400", "500", "600"],
})

export const serif = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  axes: ["opsz"],
})
