import DOMPurify from "isomorphic-dompurify"

/**
 * Sanea HTML antes de insertarlo con dangerouslySetInnerHTML.
 * Se aplica siempre en el momento de mostrar el contenido (no al guardar),
 * para no perder datos si en el futuro se amplian las etiquetas permitidas.
 *
 * Permite etiquetas de formato de texto habituales en una ficha descriptiva
 * (titulos, parrafos, listas, negrita, enlaces) y tambien imagenes/video,
 * porque el dossier de una propiedad se alimenta como un unico documento
 * HTML que ya incluye sus fotos y su video embebidos. Si se pega un
 * documento completo (con <!DOCTYPE>, <html>, <head>, <body>), DOMPurify
 * descarta esas etiquetas envolventes y conserva solo el contenido util.
 * Bloquea scripts, iframes, estilos inline y manejadores de eventos.
 */
export function sanitizePropertyHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "span",
      "div",
      "img",
      "video",
      "source",
      "figure",
      "figcaption",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "controls",
      "poster",
      "loop",
      "muted",
      "autoplay",
      "playsinline",
      "preload",
      "width",
      "height",
    ],
  })
}
