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
 * 2. La foto incrustada mas pesada: es la principal (un logo o icono pesa poco).
 * 3. La primera imagen enlazada (https), o la primera imagen de fondo en CSS.
 */
function findCover(doc: Document, html: string, photoSizes: Map<string, number>): string | null {
  const og = doc.querySelector("meta[property='og:image'], meta[name='og:image']")?.getAttribute("content")
  if (og && /^https?:/i.test(og)) return og
  const largest = [...photoSizes.entries()].sort((a, b) => b[1] - a[1])[0]
  if (largest) return largest[0]
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
  // Tamaño de cada foto subida, para elegir la portada (la mas grande, nunca un logo)
  const photoSizes = new Map<string, number>()
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
        if (mime.startsWith("image/")) photoSizes.set(url, base64.length)
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
  const title = (doc.querySelector("title")?.textContent || doc.querySelector("h1")?.textContent || "").trim() || null

  return {
    html,
    title,
    coverUrl: findCover(doc, html, photoSizes),
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
