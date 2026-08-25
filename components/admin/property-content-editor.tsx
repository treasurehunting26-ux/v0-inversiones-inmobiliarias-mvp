"use client"

import { useRef, useState } from "react"
import { Check, Copy, Loader2, Trash2, Upload, X } from "lucide-react"
import { type AdminProperty, updateContent, uploadMedia } from "@/lib/admin-api"

interface PropertyContentEditorProps {
  token: string
  property: AdminProperty
  onSaved: () => void
  onClose: () => void
}

export function PropertyContentEditor({
  token,
  property,
  onSaved,
  onClose,
}: PropertyContentEditorProps) {
  const [descriptionHtml, setDescriptionHtml] = useState(property.description_html || "")
  const [photos, setPhotos] = useState<string[]>(property.photos || [])
  const [videoUrl, setVideoUrl] = useState<string | null>(property.video_url || null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [manualPhotoUrl, setManualPhotoUrl] = useState("")
  const [manualVideoUrl, setManualVideoUrl] = useState("")

  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const dossierUrl =
    property.dossier_slug && typeof window !== "undefined"
      ? `${window.location.origin}/dossier/${property.dossier_slug}`
      : null

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploadingPhoto(true)
    try {
      const url = await uploadMedia(token, file, "photo")
      setPhotos((prev) => [...prev, url])
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
      setVideoUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el video")
    } finally {
      setUploadingVideo(false)
      if (videoInputRef.current) videoInputRef.current.value = ""
    }
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url))
  }

  function addPhotoByUrl() {
    const url = manualPhotoUrl.trim()
    if (!url) return
    setPhotos((prev) => (prev.includes(url) ? prev : [...prev, url]))
    setManualPhotoUrl("")
  }

  function addVideoByUrl() {
    const url = manualVideoUrl.trim()
    if (!url) return
    setVideoUrl(url)
    setManualVideoUrl("")
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateContent(token, property.id, {
        description_html: descriptionHtml,
        photos,
        video_url: videoUrl || "",
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
          Contenido y dossier de &quot;{property.title}&quot;
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

      {/* Fotos */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fotos</span>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {photos.map((url) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                <img src={url || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Quitar foto"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted">
          {uploadingPhoto ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploadingPhoto ? "Subiendo..." : "Anadir foto (JPG, PNG, WEBP, hasta 8 MB)"}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={handlePhotoSelect}
            disabled={uploadingPhoto}
          />
        </label>
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={manualPhotoUrl}
            onChange={(e) => setManualPhotoUrl(e.target.value)}
            placeholder="O pega aqui el enlace de una foto ya subida"
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground outline-none transition-colors focus:border-primary"
          />
          <button
            type="button"
            onClick={addPhotoByUrl}
            disabled={!manualPhotoUrl.trim()}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Anadir
          </button>
        </div>
      </div>

      {/* Video */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Video</span>
        {videoUrl && (
          <div className="flex items-center gap-3">
            <video src={videoUrl} controls className="h-32 w-56 rounded-lg border border-border bg-card object-cover" />
            <button
              type="button"
              onClick={() => setVideoUrl(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Quitar video
            </button>
          </div>
        )}
        {!videoUrl && (
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted">
            {uploadingVideo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploadingVideo ? "Subiendo..." : "Subir video (MP4, breve y comprimido, hasta 150 MB)"}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleVideoSelect}
              disabled={uploadingVideo}
            />
          </label>
        )}
        {!videoUrl && (
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={manualVideoUrl}
              onChange={(e) => setManualVideoUrl(e.target.value)}
              placeholder="O pega aqui el enlace de un video ya subido"
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground outline-none transition-colors focus:border-primary"
            />
            <button
              type="button"
              onClick={addVideoByUrl}
              disabled={!manualVideoUrl.trim()}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Anadir
            </button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Recomendado: 60-90 segundos y comprimido (menos de 40 MB) para que cargue al instante.
        </p>
      </div>

      {/* Descripcion HTML */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Contenido detallado (HTML)
        </span>
        <textarea
          rows={8}
          value={descriptionHtml}
          onChange={(e) => setDescriptionHtml(e.target.value)}
          placeholder="<p>Descripcion de la propiedad...</p>"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors focus:border-primary"
        />
        <p className="text-xs text-muted-foreground">
          Se admite HTML basico (parrafos, titulos, listas, negrita, enlaces). Las fotos y el video no van
          aqui: se colocan automaticamente con los uploads de arriba. Por seguridad, cualquier etiqueta no
          permitida (scripts, iframes) se elimina al mostrarse.
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
          {saving ? "Guardando..." : "Guardar contenido"}
        </button>
      </div>
    </div>
  )
}
