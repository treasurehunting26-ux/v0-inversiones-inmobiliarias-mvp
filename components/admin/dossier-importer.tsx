"use client"

import { useRef, useState, type DragEvent, type ReactNode } from "react"
import { AlertTriangle, CheckCircle2, FileCode, Loader2, Sparkles, UploadCloud } from "lucide-react"
import {
  type AdminProperty,
  type PropertyFields,
  createProperty,
  extractFields,
  fetchLegacyDossier,
  updateContent,
  updateFields,
  updateStatus,
} from "@/lib/admin-api"
import { type DossierProgress, type ProcessedDossier, processDossierHtml, readFileAsText } from "@/lib/dossier-import"
import { DossierFrame } from "@/components/dossier/dossier-frame"

interface DossierImporterProps {
  token: string
  /** Sin propiedad: alta nueva. Con propiedad: reemplazar (o recuperar) su dossier. */
  property?: AdminProperty
  /** Reimportar el dossier subido con el sistema anterior (Vercel Blob). */
  recoverLegacy?: boolean
  onDone: () => void
  onCancel: () => void
}

type Stage = "pick" | "processing" | "review" | "saving"

const EMPTY: PropertyFields = {
  title: "",
  location: "",
  asset_type: "",
  investment_range: "",
  horizon: "",
  risk_notes: "",
}

const REQUIRED: (keyof PropertyFields)[] = ["title", "location", "asset_type", "investment_range"]

function progressLabel(p: DossierProgress | null): string {
  if (!p || p.step === "reading") return "Leyendo el dossier…"
  if (p.step === "uploading") return p.total ? `Subiendo fotos y vídeos ${p.done} de ${p.total}…` : "Preparando…"
  return "Leyendo los datos del dossier…"
}

export function DossierImporter({ token, property, recoverLegacy = false, onDone, onCancel }: DossierImporterProps) {
  const isNew = !property
  const [stage, setStage] = useState<Stage>("pick")
  const [progress, setProgress] = useState<DossierProgress | null>(null)
  const [result, setResult] = useState<ProcessedDossier | null>(null)
  const [fields, setFields] = useState<PropertyFields>(
    property
      ? {
          title: property.title,
          location: property.location,
          asset_type: property.asset_type,
          investment_range: property.investment_range,
          horizon: property.horizon,
          risk_notes: property.risk_notes,
        }
      : EMPTY,
  )
  const [suggested, setSuggested] = useState<Partial<PropertyFields> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function process(getHtml: () => Promise<string>) {
    setError(null)
    setStage("processing")
    setProgress(null)
    try {
      const html = await getHtml()
      const processed = await processDossierHtml(html, token, setProgress)
      setResult(processed)

      // Propuesta de datos desde el texto del dossier (la revisa el humano)
      setProgress({ step: "analyzing", done: 0, total: 0 })
      let proposal: Partial<PropertyFields> = {}
      try {
        const extracted = await extractFields(token, processed.text, processed.title)
        proposal = Object.fromEntries(
          Object.entries(extracted).filter(([, v]) => typeof v === "string" && v.trim()),
        ) as Partial<PropertyFields>
      } catch (err) {
        if (err instanceof Error && err.message === "UNAUTHORIZED") throw err
        proposal = processed.title ? { title: processed.title } : {}
      }
      if (isNew) setFields({ ...EMPTY, ...proposal })
      else setSuggested(proposal)
      setStage("review")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar el dossier")
      setStage("pick")
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return
    void process(() => readFileAsText(file))
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  async function save(publish: boolean) {
    if (!result) return
    const missing = REQUIRED.filter((k) => !fields[k].trim())
    if (missing.length) {
      setError("Completa título, ubicación, tipo de activo e inversión antes de guardar.")
      return
    }
    setError(null)
    setStage("saving")
    const cleanFields = Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, v.trim()]),
    ) as PropertyFields
    try {
      if (isNew) {
        const created = await createProperty(token, {
          ...cleanFields,
          description_html: result.html,
          photos: result.coverUrl ? [result.coverUrl] : [],
        })
        if (publish) await updateStatus(token, created.id, "published")
      } else {
        await updateContent(token, property.id, {
          description_html: result.html,
          dossier_html_url: "",
          ...(result.coverUrl ? { photos: [result.coverUrl] } : {}),
        })
        await updateFields(token, property.id, cleanFields)
      }
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar")
      setStage("review")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {isNew ? "Nueva propiedad desde su dossier" : recoverLegacy ? "Recuperar el dossier subido" : "Reemplazar dossier"}
        </h3>
        <p className="text-sm text-muted-foreground">
          El dossier es la ficha: así es como se verá la propiedad en la web, tal cual lo diseñaste.
        </p>
      </div>

      {stage === "pick" && (
        <>
          {recoverLegacy ? (
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-sm text-foreground">
                Este dossier se subió con el sistema anterior y Vercel Blob no permite mostrarlo dentro de la web.
                Lo recupero y lo convierto al formato nuevo; después revisas los datos y guardas.
              </p>
              <button
                type="button"
                onClick={() => void process(() => fetchLegacyDossier(token, property!.id))}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <FileCode className="h-4 w-4" /> Recuperar dossier
              </button>
              <p className="mt-3 text-xs text-muted-foreground">O sube de nuevo el archivo .html:</p>
            </div>
          ) : null}
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
              dragging ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40"
            }`}
          >
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Arrastra aquí el archivo .html del dossier</span>
            <span className="text-xs text-muted-foreground">
              o haz clic para elegirlo. Las fotos y vídeos incrustados se suben solos.
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".html,.htm,text/html"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0])
                e.target.value = ""
              }}
            />
          </label>
        </>
      )}

      {stage === "processing" && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-foreground">{progressLabel(progress)}</p>
            {progress?.step === "uploading" && progress.total > 0 && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {(stage === "review" || stage === "saving") && result && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vista previa (así se verá en la web)
            </p>
            <div className="overflow-hidden rounded-lg border border-border">
              <DossierFrame html={result.html} title="Vista previa del dossier" className="h-[560px]" />
            </div>
            <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {result.uploadedCount} fotos/vídeos subidos · dossier final de {result.sizeKb} KB
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {result.coverUrl ? "Portada del catálogo: la foto principal del dossier" : "Sin imagen de portada: la tarjeta del catálogo usará la inicial"}
              </li>
            </ul>
            {result.missingFiles.length > 0 && (
              <Notice>
                El dossier enlaza archivos que están en tu ordenador y no se verán en la web:{" "}
                <span className="font-mono">{result.missingFiles.slice(0, 5).join(", ")}</span>
                {result.missingFiles.length > 5 && ` y ${result.missingFiles.length - 5} más`}. Incrústalos en el
                HTML o usa enlaces https y vuelve a subirlo.
              </Notice>
            )}
            {result.sizeKb > 3000 && (
              <Notice>
                El dossier pesa {Math.round(result.sizeKb / 1024)} MB después de subir las fotos (probablemente por
                fuentes incrustadas). Funcionará, pero cargará más lento en móvil.
              </Notice>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-foreground">
                {isNew
                  ? "He rellenado los datos leyendo el dossier. Revísalos: los usa el catálogo y Brigitte."
                  : "Datos actuales de la ficha. Puedes actualizarlos con lo que dice el nuevo dossier."}
              </p>
            </div>
            {!isNew && suggested && Object.keys(suggested).length > 0 && (
              <button
                type="button"
                onClick={() => setFields((f) => ({ ...f, ...suggested }))}
                className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                <Sparkles className="h-3.5 w-3.5" /> Usar los datos del nuevo dossier
              </button>
            )}
            <FieldsForm fields={fields} onChange={setFields} disabled={stage === "saving"} />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={stage === "saving"}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                Cancelar
              </button>
              {isNew ? (
                <>
                  <button
                    type="button"
                    onClick={() => void save(false)}
                    disabled={stage === "saving"}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    Guardar borrador
                  </button>
                  <button
                    type="button"
                    onClick={() => void save(true)}
                    disabled={stage === "saving"}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {stage === "saving" ? "Guardando…" : "Guardar y publicar"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => void save(false)}
                  disabled={stage === "saving"}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {stage === "saving" ? "Guardando…" : "Guardar dossier"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {stage === "pick" && error && <p className="text-sm text-destructive">{error}</p>}
      {stage === "pick" && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-lg border border-border bg-card p-3 text-xs leading-relaxed text-foreground">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"

export function FieldsForm({
  fields,
  onChange,
  disabled,
}: {
  fields: PropertyFields
  onChange: (f: PropertyFields) => void
  disabled?: boolean
}) {
  const set = (key: keyof PropertyFields) => (value: string) => onChange({ ...fields, [key]: value })
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Título" required value={fields.title} onChange={set("title")} disabled={disabled} />
      <Field label="Ubicación" required value={fields.location} onChange={set("location")} disabled={disabled} placeholder="Marbella, Costa del Sol" />
      <Field label="Tipo de activo" required value={fields.asset_type} onChange={set("asset_type")} disabled={disabled} placeholder="Villa, ático, edificio…" />
      <Field label="Inversión" required value={fields.investment_range} onChange={set("investment_range")} disabled={disabled} placeholder="3.450.000 €" />
      <Field label="Horizonte" value={fields.horizon} onChange={set("horizon")} disabled={disabled} placeholder="Opcional" />
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notas de riesgo</span>
        <textarea
          rows={3}
          value={fields.risk_notes}
          onChange={(e) => set("risk_notes")(e.target.value)}
          disabled={disabled}
          placeholder="Opcional. Brigitte las usa al hablar de riesgos."
          className={inputClass}
        />
      </label>
    </div>
  )
}

function Field({
  label,
  required,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
        {required && <span className="ml-0.5">*</span>}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  )
}
