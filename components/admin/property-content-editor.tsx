"use client"

import { useRef, useState } from "react"
import { Check, Copy, FileCode, ImageIcon, Loader2, VideoIcon, X } from "lucide-react"
import {
  type AdminProperty,
  updateContent,
  uploadDossierHtml,
  uploadMedia,
  uploadPhotoFromUrl,
} from "@/lib/admin-api"

interface PropertyContentEditorProps {
  token: string
  property: AdminProperty
  onSaved: () => void
  onClose: () => void
}

/**
 * Editor de contenido: la propiedad se alimenta como UN solo dossier
 * (documento HTML) en vez de gestionar fotos, video y texto por separado.
 * Los botones de "Insertar foto/video" siguen usando el mismo pipeline de
 * subida y compresion de antes, pero en vez de guardar la foto en una
 * lista aparte, insertan la etiqueta <img>/<video> directamente en el
 * dossier, en el punto donde este el cursor. Asi el contenido final es
 * autocontenido: se puede pegar un documento ya armado (con sus fotos y
 * video incluidos) o construirlo aqui mismo con estos botones.
 */
export function PropertyContentEditor({
  token,
  property,
  onSaved,
  onClose,
}: PropertyContentEditorProps) {
  const [descriptionHtml, setDescriptionHtml] = useState(property.description_html || "")
  const [dossierHtmlUrl, setDossierHtmlUrl] = useState(property.dossier_html_url || "")
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingDossierFile, setUploadingDossierFile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [manualMediaUrl, setManualMediaUrl] = useState("")

  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const dossierFileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const dossierUrl =
    property.dossier_slug && typeof window !== "undefined"
      ? `${window.location.origin}/dossier/${property.dossier_slug}`
      : null

  function insertAtCursor(snippet: string) {
    const textarea = textareaRef.current
    if (!textarea) {
      setDescriptionHtml((prev) => `${prev}\n${snippet}\n`)
      return
    }
    const start = textarea.selectionStart ?? textarea.value.length
    const end = textarea.selectionEnd ?? textarea.value.length
    const next = `${textarea.value.slice(0, start)}\n${snippet}\n${textarea.value.slice(end)}`
    setDescriptionHtml(next)
    requestAnimationFrame(() => {
      const cursor = start + snippet.length + 2
      textarea.focus()
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploadingPhoto(true)
    try {
      const url = await uploadMedia(token, file, "photo")
      insertAtCursor(`<img src="${url}" alt="${property.title}" />`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto")
    } finally {
      setUploadingPhoto(false)
      if (photoInputRef.current) photoInputRef.current.value = ""
    }
  }

  async function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploadingVideo(true)
    try {
      const url = await uploadMedia(token, file, "video")
      insertAtCursor(`<video src="${url}" controls></video>`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el video")
    } finally {
      setUploadingVideo(false)
      if (videoInputRef.current) videoInputRef.current.value = ""
    }
  }

  async function addMediaByUrl() {
    const url = manualMediaUrl.trim()
    if (!url) return
    setError(null)
    const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url)
    if (isVideo) {
      insertAtCursor(`<video src="${url}" controls></video>`)
      setManualMediaUrl("")
      return
    }
    setUploadingPhoto(true)
    try {
      const compressedUrl = await uploadPhotoFromUrl(token, url)
      insertAtCursor(`<img src="${compressedUrl}" alt="${property.title}" />`)
      setManualMediaUrl("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo anadir el contenido desde ese enlace")
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleDossierFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploadingDossierFile(true)
    try {
      const url = await uploadDossierHtml(token, file)
      setDossierHtmlUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el dossier")
    } finally {
      setUploadingDossierFile(false)
      if (dossierFileInputRef.current) dossierFileInputRef.current.value = ""
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateContent(token, property.id, {
        description_html: descriptionHtml,
        dossier_html_url: dossierHtmlUrl,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el contenido")
    } finally {
      setSaving(false)
    }
  }

  async function copyDossierLink() {
    if (!dossierUrl) return
    await navigator.clipboard.writeText(dossierUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-4 flex flex-col gap-6 rounded-lg border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-base font-semibold text-foreground">
          Dossier de &quot;{property.title}&quot;
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          aria-label="Cerrar editor de contenido"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Enlace de dossier */}
      {dossierUrl && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Enlace de dossier (para compartir por WhatsApp o email)
          </span>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={dossierUrl}
              className="flex-1 truncate rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
            />
            <button
              type="button"
              onClick={copyDossierLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Pagina propia, sin menu ni marca de terceros. Funciona aunque la propiedad este en borrador.
          </p>
        </div>
      )}

      {/* Dossier prediseñado fuera del panel: sustituye por completo al editor de abajo */}
      <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Dossier ya diseñado (archivo .html completo)
        </span>
        <p className="text-xs text-muted-foreground">
          Si ya tienes el dossier armado como una pagina HTML completa (con sus fotos y estilos), subelo o
          pega aqui su enlace. Cuando este campo tiene un valor, el enlace de dossier de arriba muestra
          esa pagina tal cual, en vez del contenido del editor de mas abajo.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted">
            {uploadingDossierFile ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileCode className="h-3.5 w-3.5" />
            )}
            {uploadingDossierFile ? "Subiendo..." : "Subir archivo .html"}
            <input
              ref={dossierFileInputRef}
              type="file"
              accept="text/html,.html"
              className="hidden"
              onChange={handleDossierFileSelect}
              disabled={uploadingDossierFile}
            />
          </label>
          {dossierHtmlUrl && (
            <button
              type="button"
              onClick={() => setDossierHtmlUrl("")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
              Quitar dossier prediseñado
            </button>
          )}
        </div>
        <input
          type="url"
          value={dossierHtmlUrl}
          onChange={(e) => setDossierHtmlUrl(e.target.value)}
          placeholder="O pega aqui el enlace del dossier ya subido (https://...)"
          disabled={uploadingDossierFile}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"
        />
      </div>

      {/* Dossier: un solo contenido con todo incluido */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Dossier (HTML con fotos y video incluidos)
        </span>
        <p className="text-xs text-muted-foreground">
          Este es el unico contenido de la ficha y del dossier: pega aqui el documento ya armado (texto, fotos
          y video) o usa los botones de abajo para insertar imagenes y video en el punto donde este el cursor.
          Solo se usa si no hay un dossier ya diseñado arriba.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted">
            {uploadingPhoto ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
            {uploadingPhoto ? "Comprimiendo y subiendo..." : "Insertar foto"}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={handlePhotoSelect}
              disabled={uploadingPhoto}
            />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted">
            {uploadingVideo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <VideoIcon className="h-3.5 w-3.5" />}
            {uploadingVideo ? "Subiendo..." : "Insertar video"}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleVideoSelect}
              disabled={uploadingVideo}
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="url"
            value={manualMediaUrl}
            onChange={(e) => setManualMediaUrl(e.target.value)}
            placeholder="O pega aqui el enlace de una foto o video ya subido"
            disabled={uploadingPhoto}
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"
          />
          <button
            type="button"
            onClick={addMediaByUrl}
            disabled={!manualMediaUrl.trim() || uploadingPhoto}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {uploadingPhoto && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {uploadingPhoto ? "Comprimiendo..." : "Insertar"}
          </button>
        </div>

        <textarea
          ref={textareaRef}
          rows={14}
          value={descriptionHtml}
          onChange={(e) => setDescriptionHtml(e.target.value)}
          placeholder="<p>Descripcion de la propiedad...</p>"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors focus:border-primary"
        />
        <p className="text-xs text-muted-foreground">
          Se admite HTML basico (parrafos, titulos, listas, negrita, enlaces, imagenes y video). Por
          seguridad, cualquier etiqueta no permitida (scripts, iframes) se elimina al mostrarse.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar dossier"}
        </button>
      </div>
    </div>
  )
}
