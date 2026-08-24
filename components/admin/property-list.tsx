"use client"

import { useState } from "react"
import { Archive, CheckCircle2, Clock, ImagePlus, Trash2 } from "lucide-react"
import {
  AdminProperty,
  deleteProperty,
  updateStatus,
} from "@/lib/admin-api"
import { PropertyContentEditor } from "@/components/admin/property-content-editor"

interface PropertyListProps {
  token: string
  properties: AdminProperty[]
  onChanged: () => void
}

export function PropertyList({
  token,
  properties,
  onChanged,
}: PropertyListProps) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function setStatus(p: AdminProperty, status: AdminProperty["status"]) {
    setBusyId(p.id)
    try {
      await updateStatus(token, p.id, status)
      onChanged()
    } finally {
      setBusyId(null)
    }
  }

  async function remove(p: AdminProperty) {
    if (!confirm(`Eliminar "${p.title}"? Esta accion es irreversible.`)) return
    setBusyId(p.id)
    try {
      await deleteProperty(token, p.id)
      onChanged()
    } finally {
      setBusyId(null)
    }
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Aun no hay propiedades. Crea la primera para que aparezca en el
          catalogo.
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {properties.map((p) => {
        const busy = busyId === p.id
        return (
          <li
            key={p.id}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {p.title}
                  </h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {p.location} {"\u00B7"} {p.asset_type}
                </p>
                <dl className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
                  <Info label="Inversion" value={p.investment_range} />
                  <Info label="Horizonte" value={p.horizon} />
                  <Info
                    label="ROI estimado"
                    value={p.roi_estimated || "No indicado"}
                  />
                </dl>
                {p.risk_notes && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Riesgos:
                    </span>{" "}
                    {p.risk_notes}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                <button
                  disabled={busy}
                  onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  {editingId === p.id ? "Cerrar contenido" : "Contenido y dossier"}
                </button>
                {p.status !== "published" && (
                  <button
                    disabled={busy}
                    onClick={() => setStatus(p, "published")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Publicar
                  </button>
                )}
                {p.status === "published" && (
                  <button
                    disabled={busy}
                    onClick={() => setStatus(p, "draft")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Volver a borrador
                  </button>
                )}
                {p.status !== "archived" && (
                  <button
                    disabled={busy}
                    onClick={() => setStatus(p, "archived")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archivar
                  </button>
                )}
                <button
                  disabled={busy}
                  onClick={() => remove(p)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              </div>
            </div>

            {editingId === p.id && (
              <PropertyContentEditor
                token={token}
                property={p}
                onClose={() => setEditingId(null)}
                onSaved={() => {
                  setEditingId(null)
                  onChanged()
                }}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  )
}

function StatusBadge({ status }: { status: AdminProperty["status"] }) {
  const map: Record<AdminProperty["status"], { label: string; className: string }> = {
    draft: {
      label: "Borrador",
      className: "bg-muted text-muted-foreground",
    },
    published: {
      label: "Publicada",
      className: "bg-primary/10 text-primary",
    },
    archived: {
      label: "Archivada",
      className: "bg-foreground/10 text-foreground",
    },
  }
  const { label, className } = map[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
