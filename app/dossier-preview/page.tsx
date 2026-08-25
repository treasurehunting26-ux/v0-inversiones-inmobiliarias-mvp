import { Fraunces, IBM_Plex_Mono, Work_Sans } from "next/font/google"
import { DossierView } from "@/components/dossier/dossier-view"
import type { Property } from "@/lib/properties-api"
import "../dossier/[slug]/dossier.css"

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

// PAGINA TEMPORAL SOLO PARA PREVISUALIZAR EL REDISEÑO DEL DOSSIER. BORRAR.
const mockProperty: Property = {
  id: "test-1",
  title: "Villa Los Monteros",
  location: "Los Monteros, Marbella Este",
  asset_type: "Villa de lujo",
  investment_range: "€4.2M – €4.8M",
  roi_estimated: "8%",
  horizon: "3–5 años",
  risk_notes:
    "Mercado consolidado con demanda internacional estable. Riesgo principal: estacionalidad del alquiler turístico y posibles cambios en la normativa local de alquiler vacacional.",
  description_html:
    "<p>Hay residencias que se enseñan y otras que se relatan. Villa Los Monteros pertenece a esta segunda categoría: una propiedad de cuatro niveles concebida no como una suma de metros cuadrados, sino como una secuencia de instantes.</p><p>La villa reúne cinco dormitorios pensados no como habitaciones, sino como suites independientes, cada una con su propia atmósfera y salida al exterior.</p><blockquote>Un salón que no decora la vida social: la organiza.</blockquote><p>El verdadero lujo de Los Monteros es el que no se fotografía: suelo radiante integral, aerotermia, domótica avanzada y un ascensor privado que conecta los cuatro niveles.</p>",
  photos: [
    "https://picsum.photos/id/164/1200/900",
    "https://picsum.photos/id/1076/1200/900",
    "https://picsum.photos/id/28/1200/900",
    "https://picsum.photos/id/106/1200/900",
    "https://picsum.photos/id/43/1200/900",
  ],
  video_url: null,
}

export default function DossierPreviewPage() {
  return (
    <div className={`${fraunces.variable} ${workSans.variable} ${plexMono.variable} dossier`}>
      <DossierView property={mockProperty} />
    </div>
  )
}
