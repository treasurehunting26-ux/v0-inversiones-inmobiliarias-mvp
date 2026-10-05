"use client"

import { useState } from "react"
import { AlertTriangle, Check, Copy, ExternalLink, FileCode, Pencil, X } from "lucide-react"
import { type AdminProperty, type PropertyFields, updateFields } from "@/lib/admin-api"
import { DossierImporter, FieldsForm } from "./dossier-importer"

interface PropertyDossierPanelProps {
  token: string
  property: AdminProperty
  onChanged: () => void
  onClose: () => void
}

type Mode = "menu" | "replace" | "recover" | "edit"

/** Dossier y datos de una propiedad: ver, compartir, corregir datos o reemplazar el dossier. */
export function PropertyDossierPanel({ token, property, onChanged, onClose }: PropertyDossierPanelProps) {
  const legacy = Boolean(property.dossier_html_url) && property.dossier_kb === 0
  const [mode, setMode] = useState<Mode>(legacy ? "recover" : "menu")
  const [fields, setFields] = useState<PropertyFields>({
    title: property.title,
    location: property.location,
    asset_type: property.asset_type,
    investment_range: property.investment_range,
    horizon: property.horizon,
    risk_notes: property.risk_notes,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const dossierUrl = property.dossier_slug ? `${origin}/dossier/${property.dossier_slug}` : null
  const listingUrl = `${origin}/oportunidades/${property.id}`

  async function copy() {
    if (!dossierUrl) return
    await navigator.clipboard.writeText(dossierUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function saveFields() {
    setSaving(true)
    setError(null)
    try {
      await updateFields(token, property.id, Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.trim()])))
      onChanged()
      setMode("menu")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar los datos")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-5 rounded-lg border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-base font-semibold text-foreground">Dossier y datos</h4>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {(mode === "replace" || mode === "recover") && (
        <DossierImporter
          token={token}
          property={property}
          recoverLegacy={mode === "recover"}
          onDone={() => {
            onChanged()
            setMode("menu")
          }}
          onCancel={() => setMode("menu")}
        />
      )}

      {mode === "edit" && (
        <div className="flex flex-col gap-4">
          <FieldsForm fields={fields} onChange={setFields} disabled={saving} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMode("menu")}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveFields}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar datos"}
            </button>
          </div>
        </div>
      )}

      {mode === "menu" && (
        <div className="flex flex-col gap-4">
          {legacy && (
            <p className="flex gap-2 rounded-lg border border-border bg-card p-3 text-sm text-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Este dossier se subió con el sistema anterior y no se puede ver en la web.
              <button type="button" onClick={() => setMode("recover")} className="font-medium underline">
                Recuperarlo
              </button>
            </p>
          )}
          {!property.has_dossier && !legacy && (
            <p className="text-sm text-muted-foreground">
              Esta propiedad aún no tiene dossier: en la web se muestra una ficha básica con sus datos.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <ActionLink href={listingUrl} disabled={property.status !== "published"}>
              <ExternalLink className="h-3.5 w-3.5" /> Ver ficha en la web
            </ActionLink>
            {dossierUrl && (
              <ActionLink href={dossierUrl}>
                <ExternalLink className="h-3.5 w-3.5" /> Ver enlace privado
              </ActionLink>
            )}
            {dossierUrl && (
              <button type="button" onClick={copy} className={actionClass}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copiado" : "Copiar enlace privado"}
              </button>
            )}
            <button type="button" onClick={() => setMode("replace")} className={actionClass}>
              <FileCode className="h-3.5 w-3.5" /> {property.has_dossier ? "Reemplazar dossier" : "Subir dossier"}
            </button>
            <button type="button" onClick={() => setMode("edit")} className={actionClass}>
              <Pencil className="h-3.5 w-3.5" /> Corregir datos
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            El enlace privado funciona aunque la propiedad esté en borrador: sirve para enviarla por WhatsApp o email
            antes de publicarla.
          </p>
        </div>
      )}
    </div>
  )
}

const actionClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"

function ActionLink({ href, disabled, children }: { href: string; disabled?: boolean; children: React.ReactNode }) {
  if (disabled) {
    return (
      <span className={`${actionClass} cursor-not-allowed opacity-50`} title="Publícala para verla en la web">
        {children}
      </span>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={actionClass}>
      {children}
    </a>
  )
}
