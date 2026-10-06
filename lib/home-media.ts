/**
 * Medios de la portada. Para cambiar el vídeo basta con sustituir estas URLs
 * (subidas a Vercel Blob).
 *
 * `orientation`:
 * - "portrait": vídeo vertical (móvil). En escritorio se muestra enmarcado
 *   junto al titular; en móvil, a pantalla completa.
 * - "landscape": vídeo horizontal (1920×1080 o más). Se muestra a pantalla
 *   completa también en escritorio.
 */
export const HERO_MEDIA = {
  video:
    "https://cnujj30t80u2gqye.public.blob.vercel-storage.com/propiedades/videos/villa-los-monteros-hero_1-Rwys8FiIJb31VsLNYjYgMTXeDvxmO2.mp4",
  poster:
    "https://cnujj30t80u2gqye.public.blob.vercel-storage.com/propiedades/dossiers/media/villa-los-monteros-dossier-privado-marbe-1-jVWBvNgw2WYc8zUHsg5eBi9nVVPgOi.jpg",
  orientation: "portrait" as "portrait" | "landscape",
}
