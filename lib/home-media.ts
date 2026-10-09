/**
 * Medios de la portada. Para cambiar el vídeo basta con sustituir estas URLs
 * (subidas a Vercel Blob).
 *
 * - `video` / `poster`: versión horizontal para escritorio (ideal 2560×1440).
 * - `videoMobile` / `posterMobile`: versión vertical para móvil (1080×1920).
 *   Si se dejan vacías, el móvil usa la versión horizontal recortada.
 *
 * `orientation`:
 * - "landscape": pantalla completa en todos los tamaños (lo elegido).
 * - "portrait": vídeo vertical; en escritorio se muestra enmarcado junto al
 *   titular.
 */
export const HERO_MEDIA = {
  video: "https://cnujj30t80u2gqye.public.blob.vercel-storage.com/propiedades/videos/hero-desktop.mp4",
  poster: "/hero/poster-desktop.jpg",
  videoMobile: "https://cnujj30t80u2gqye.public.blob.vercel-storage.com/propiedades/videos/hero-mobile.mp4",
  posterMobile: "/hero/poster-mobile.jpg",
  orientation: "landscape" as "portrait" | "landscape",
  /**
   * Ancho real del vídeo de escritorio en píxeles. Si es menor de 1280, en
   * escritorio se muestra la foto (`poster`) con zoom lento en lugar del
   * vídeo, porque estirado a pantalla completa se pixela.
   */
  videoWidth: 2560,
}

export const HERO_VIDEO_ON_DESKTOP = HERO_MEDIA.videoWidth >= 1280

/**
 * Tarjetas de mercados (Europa, Latinoamérica, Dubái), en el orden del
 * diccionario. `poster`: foto fija (siempre visible; la única en móvil).
 * `video`: clip corto que se reproduce al pasar el ratón en escritorio.
 * Vídeo vacío = solo foto.
 */
export const MARKET_MEDIA: { poster: string; video: string }[] = [
  { poster: "/images/market-europa.jpg", video: "" },
  { poster: "/images/market-latam.jpg", video: "" },
  { poster: "/images/market-dubai.jpg", video: "" },
]
