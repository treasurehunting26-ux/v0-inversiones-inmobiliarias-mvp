/**
 * Importacion de un dossier HTML (el dossier ES la ficha de la propiedad).
 *
 * Un dossier exportado suele llevar sus fotos incrustadas en base64
 * (data:image/...), lo que lo hace pesar decenas de MB. Aqui, en el
 * navegador:
 *  1. Se localizan las imagenes/videos incrustados (en <img>, srcset y CSS).
 *  2. Se suben a Vercel Blob (las fotos JPEG/WebP se recomprimen; PNG con
 *     transparencia y SVG/GIF se respetan) y se sustituye cada data: por
 *     su URL. El HTML resultante pesa pocos KB.
 *  3. Se detecta el titulo, la portada (para la tarjeta del catalogo) y
 *     el texto visible (para proponer los datos de la ficha).
 *  4. Se avisa de referencias a archivos locales ("fotos/cocina.jpg") que
 *     no se pueden mostrar en la web.
 *
 * El HTML final se guarda en la base de datos (no en Blob: Blob sirve sus
 * archivos con cabeceras que impiden mostrarlos como pagina).
 */

import { compressImage } from "./compress-image"

export type DossierProgress = { step: "reading" | "uploading" | "analyzing"; done: number; total: number }

export type ProcessedDossier = {
  html: string
  title: string | null
  coverUrl: string | null
  text: string
  uploadedCount: number
  keptInline: number
  missingFiles: string[]
  sizeKb: number
}

const DATA_URI = /data:((?:image|video)\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)/gi
const UPLOADABLE_PHOTO = ["image/jpeg", "image/png", "image/webp", "image/avif"]
const UPLOADABLE_VIDEO = ["video/mp4", "video/webm", "video/quicktime"]
const RECOMPRESS = ["image/jpeg", "image/webp"]
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
}
const PARALLEL_UPLOADS = 3

function base64ToFile(base64: string, mime: string, name: string): File {
  const clean = base64.replace(/\s+/g, "")
  const binary = atob(clean)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], name, { type: mime })
}

function slug(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "dossier"
  )
}

async function uploadAsset(token: string, file: File): Promise<string> {
  const { upload } = await import("@vercel/blob/client")
  const kind = file.type.startsWith("video/") ? "video" : "photo"
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), kind === "video" ? 180_000 : 60_000)
  try {
    const blob = await upload(`propiedades/dossiers/media/${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
      headers: { "X-Admin-Token": token },
      clientPayload: JSON.stringify({ kind }),
      abortSignal: controller.signal,
    })
    return blob.url
  } finally {
    clearTimeout(timeout)
  }
}

function isRemoteOrInline(ref: string): boolean {
  return /^(https?:|data:|blob:|#|mailto:|tel:|javascript:|\/\/)/i.test(ref.trim()) || ref.trim() === ""
}

/** Referencias a archivos locales que no viajan con el HTML. */
function findMissingFiles(doc: Document, html: string): string[] {
  const refs = new Set<string>()
  doc.querySelectorAll("img[src], video[src], source[src], link[rel='stylesheet'][href], script[src]").forEach((el) => {
    const ref = el.getAttribute("src") ?? el.getAttribute("href") ?? ""
    if (!isRemoteOrInline(ref)) refs.add(ref)
  })
  for (const match of html.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) {
    if (!isRemoteOrInline(match[1])) refs.add(match[1])
  }
  return [...refs].slice(0, 20)
}

/**
 * Portada para la tarjeta del catalogo:
 * 1. og:image si el dossier la declara (control total desde el diseño).
 * 2. La primera foto del dossier (en orden de lectura) que sea de las grandes:
 *    suele ser la imagen de cabecera. Se exige al menos la mitad del tamaño
 *    de la foto mas pesada para no elegir nunca un logo o icono.
 * 3. La primera imagen enlazada (https), o la primera imagen de fondo en CSS.
 */
function findCover(
  doc: Document,
  html: string,
  photos: { url: string; size: number; order: number }[],
): string | null {
  const og = doc.querySelector("meta[property='og:image'], meta[name='og:image']")?.getAttribute("content")
  if (og && /^https?:/i.test(og)) return og
  if (photos.length) {
    const max = Math.max(...photos.map((p) => p.size))
    const hero = [...photos].sort((a, b) => a.order - b.order).find((p) => p.size >= max * 0.5)
    if (hero) return hero.url
  }
  for (const img of Array.from(doc.querySelectorAll("img[src]"))) {
    const src = img.getAttribute("src") || ""
    if (/^https?:/i.test(src) && !/\.svg(\?|$)/i.test(src)) return src
  }
  const css = html.match(/url\(\s*['"]?(https?:[^'")]+\.(?:jpe?g|png|webp|avif)[^'")]*)['"]?\s*\)/i)
  return css ? css[1] : null
}

function visibleText(doc: Document): string {
  const clone = doc.cloneNode(true) as Document
  clone.querySelectorAll("script, style, noscript, template, svg").forEach((el) => el.remove())
  const text = (clone.body?.textContent || "").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim()
  return text.slice(0, 20000)
}

/**
 * Dossiers exportados como "pagina empaquetada" (bundle de Claude Design y
 * similares): el HTML visible es solo un cargador; el diseño real va en
 * <script type="__bundler/template"> y las fotos/scripts en
 * <script type="__bundler/manifest"> (base64, a veces gzip). Se desempaqueta
 * aqui igual que haria el cargador en el navegador, pero dejando un HTML
 * normal: cada recurso pasa a data: URI y el paso siguiente sube las fotos a
 * Blob. Asi el dossier pesa poco, tiene portada y Brigitte puede leer su texto.
 */
type BundleEntry = { mime: string; compressed?: boolean; data: string }

/** Texto de un titulo respetando los saltos de linea (<br>) como espacios. */
function headingText(el: Element | null): string {
  if (!el) return ""
  const clone = el.cloneNode(true) as Element
  clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "))
  return (clone.textContent || "").replace(/\s+/g, " ").trim()
}

function isBundledPage(html: string): boolean {
  return /type=["']__bundler\/manifest["']/i.test(html) && /type=["']__bundler\/template["']/i.test(html)
}

async function gunzip(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = ""
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

async function unbundlePage(html: string): Promise<string> {
  const outer = new DOMParser().parseFromString(html, "text/html")
  const read = (type: string) => outer.querySelector(`script[type="${type}"]`)?.textContent ?? ""
  const manifest = JSON.parse(read("__bundler/manifest") || "{}") as Record<string, BundleEntry>
  let template = JSON.parse(read("__bundler/template") || '""') as string
  const extResources = JSON.parse(read("__bundler/ext_resources") || "[]") as { id: string; uuid: string }[]
  const pageOrder = JSON.parse(read("__bundler/page_order") || "[]") as string[]
  if (!template) throw new Error("El dossier empaquetado no contiene su diseño (falta la plantilla).")
  // Paginas anidadas (iframes dentro del dossier): caso raro, se deja tal cual.
  if (pageOrder.length > 0) return html

  // Recurso -> data: URI (descomprimido si viene en gzip)
  const dataUris: Record<string, string> = {}
  const texts: Record<string, string> = {}
  for (const [uuid, entry] of Object.entries(manifest)) {
    let base64 = entry.data.replace(/\s+/g, "")
    if (entry.compressed) {
      const raw = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
      const plain = await gunzip(raw)
      base64 = bytesToBase64(plain)
      if (/javascript|jsx|babel|text\//i.test(entry.mime)) texts[uuid] = new TextDecoder().decode(plain)
    } else if (/javascript|jsx|babel|text\//i.test(entry.mime)) {
      texts[uuid] = new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)))
    }
    dataUris[uuid] = `data:${entry.mime};base64,${base64}`
  }

  // Scripts text/babel con src: se incrustan (Babel no puede leer data: por XHR)
  const doc = new DOMParser().parseFromString(template, "text/html")
  doc.querySelectorAll('script[type="text/babel"][src], script[type="text/jsx"][src]').forEach((s) => {
    const uuid = s.getAttribute("src") || ""
    if (texts[uuid] !== undefined) {
      s.textContent = texts[uuid]
      s.removeAttribute("src")
    }
  })
  template = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML

  for (const [uuid, uri] of Object.entries(dataUris)) template = template.split(uuid).join(uri)
  template = template.replace(/\s+integrity="[^"]*"/gi, "").replace(/\s+crossorigin="[^"]*"/gi, "")

  // Librerias externas (React, etc.) que el diseño pide por su URL original
  const resourceMap: Record<string, string> = {}
  for (const r of extResources) if (dataUris[r.uuid]) resourceMap[r.id] = dataUris[r.uuid]
  const resourceScript = `<script>window.__resources = ${JSON.stringify(resourceMap).replace(/<\//g, "<\\/")};</script>`
  const head = template.match(/<head[^>]*>/i)
  if (head && head.index !== undefined) {
    const i = head.index + head[0].length
    template = template.slice(0, i) + resourceScript + template.slice(i)
  }
  // Titulo: el cargador se llama "Bundled Page"; se usa el del diseño o su h1
  if (!/<title>/i.test(template)) {
    const h1 = headingText(doc.querySelector("h1"))
    if (h1 && head && head.index !== undefined) {
      const at = template.indexOf(">", template.search(/<head[^>]*>/i)) + 1
      template = template.slice(0, at) + `<title>${h1.replace(/</g, "&lt;")}</title>` + template.slice(at)
    }
  }
  return template
}

export function isFullHtmlDocument(html: string): boolean {
  return /<html[\s>]|<!doctype html/i.test(html.slice(0, 5000))
}

export async function processDossierHtml(
  rawHtml: string,
  token: string,
  onProgress?: (p: DossierProgress) => void,
): Promise<ProcessedDossier> {
  onProgress?.({ step: "reading", done: 0, total: 0 })
  if (!isFullHtmlDocument(rawHtml)) {
    throw new Error("El archivo no parece un documento HTML completo (falta <html> o <!DOCTYPE html>).")
  }
  if (isBundledPage(rawHtml)) rawHtml = await unbundlePage(rawHtml)

  const probe = new DOMParser().parseFromString(rawHtml, "text/html")
  const baseName = slug(probe.querySelector("title")?.textContent || probe.querySelector("h1")?.textContent || "dossier")

  // 1-2. Subir lo incrustado y reemplazarlo por su URL
  const unique = new Map<string, { mime: string; base64: string }>()
  for (const match of rawHtml.matchAll(DATA_URI)) {
    if (!unique.has(match[0])) unique.set(match[0], { mime: match[1].toLowerCase(), base64: match[2] })
  }
  const uploadable = [...unique.entries()].filter(
    ([, v]) => UPLOADABLE_PHOTO.includes(v.mime) || UPLOADABLE_VIDEO.includes(v.mime),
  )
  const replacements = new Map<string, string>()
  // Fotos subidas (tamaño y orden en el dossier), para elegir la portada
  const photos: { url: string; size: number; order: number }[] = []
  let done = 0
  onProgress?.({ step: "uploading", done, total: uploadable.length })

  let cursor = 0
  async function worker() {
    while (cursor < uploadable.length) {
      const index = cursor++
      const [uri, { mime, base64 }] = uploadable[index]
      let file = base64ToFile(base64, mime, `${baseName}-${index + 1}.${EXTENSIONS[mime] ?? "bin"}`)
      if (RECOMPRESS.includes(mime)) file = await compressImage(file)
      try {
        const url = await uploadAsset(token, file)
        replacements.set(uri, url)
        if (mime.startsWith("image/")) photos.push({ url, size: base64.length, order: index })
      } catch (err) {
        const reason = err instanceof Error ? err.message : ""
        throw new Error(
          `No se pudo subir el archivo ${index + 1} de ${uploadable.length} del dossier${reason ? ` (${reason})` : ""}. Inténtalo de nuevo.`,
        )
      }
      done++
      onProgress?.({ step: "uploading", done, total: uploadable.length })
    }
  }
  await Promise.all(Array.from({ length: Math.min(PARALLEL_UPLOADS, uploadable.length) }, worker))

  let html = rawHtml
  for (const [uri, url] of replacements) html = html.split(uri).join(url)

  // 3. Titulo, portada y texto
  onProgress?.({ step: "analyzing", done: 0, total: 0 })
  const doc = new DOMParser().parseFromString(html, "text/html")
  const title = (doc.querySelector("title")?.textContent || headingText(doc.querySelector("h1")) || "").trim() || null

  return {
    html,
    title,
    coverUrl: findCover(doc, html, photos),
    text: visibleText(doc),
    uploadedCount: replacements.size,
    keptInline: unique.size - uploadable.length,
    missingFiles: findMissingFiles(doc, html),
    sizeKb: Math.round(new Blob([html]).size / 1024),
  }
}

export async function readFileAsText(file: File): Promise<string> {
  if (!/\.html?$/i.test(file.name) && file.type !== "text/html") {
    throw new Error("Elige un archivo .html")
  }
  return file.text()
}
