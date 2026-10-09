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
  video:
    "https://cnujj30t80u2gqye.public.blob.vercel-storage.com/propiedades/videos/villa-los-monteros-hero_1-Rwys8FiIJb31VsLNYjYgMTXeDvxmO2.mp4",
  poster:
    "https://cnujj30t80u2gqye.public.blob.vercel-storage.com/propiedades/dossiers/media/villa-los-monteros-dossier-privado-marbe-1-jVWBvNgw2WYc8zUHsg5eBi9nVVPgOi.jpg",
  videoMobile: "",
  posterMobile: "",
  orientation: "landscape" as "portrait" | "landscape",
  /**
   * Ancho real del vídeo de escritorio en píxeles. Si es menor de 1280, en
   * escritorio se muestra la foto (`poster`) con zoom lento en lugar del
   * vídeo, porque estirado a pantalla completa se pixela.
   */
  videoWidth: 478,
}

export const HERO_VIDEO_ON_DESKTOP = HERO_MEDIA.videoWidth >= 1280
