import DOMPurify from "isomorphic-dompurify"

/**
 * Sanea HTML antes de insertarlo con dangerouslySetInnerHTML.
 * Se aplica siempre en el momento de mostrar el contenido (no al guardar),
 * para no perder datos si en el futuro se amplian las etiquetas permitidas.
 *
 * Permite solo etiquetas de formato de texto habituales en una ficha
 * descriptiva (titulos, parrafos, listas, negrita, enlaces). Bloquea
 * scripts, iframes, estilos inline y manejadores de eventos.
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
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  })
}
