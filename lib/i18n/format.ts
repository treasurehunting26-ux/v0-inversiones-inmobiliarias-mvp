/** Sustituye {clave} en un texto: format("Hola {name}", { name: "Ana" }). Seguro en cliente. */
export function format(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`)
}
