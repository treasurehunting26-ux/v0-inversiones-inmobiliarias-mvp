"use client"

import { useState } from "react"
import { createProperty, type PropertyCreatePayload } from "@/lib/admin-api"

interface PropertyFormProps {
  token: string
  onCreated: () => void
}

const initial: PropertyCreatePayload = {
  title: "",
  location: "",
  asset_type: "",
  investment_range: "",
  horizon: "",
  risk_notes: "",
  roi_estimated: "",
}

export function PropertyForm({ token, onCreated }: PropertyFormProps) {
  const [data, setData] = useState<PropertyCreatePayload>(initial)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof PropertyCreatePayload>(
    key: K,
    value: PropertyCreatePayload[K],
  ) {
    setData((d) => ({ ...d, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = { ...data }
      if (!payload.roi_estimated) delete (payload as { roi_estimated?: string }).roi_estimated
      await createProperty(token, payload)
      setData(initial)
      onCreated()
    } catch {
      setError("No se pudo crear la propiedad")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground">
          Nueva propiedad
        </h3>
        <p className="text-sm text-muted-foreground">
          Se crea como borrador. Para publicarla usa el boton "Publicar" en la
          lista.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Titulo" required>
          <input
            type="text"
            required
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Ubicacion" required>
          <input
            type="text"
            required
            placeholder="Marbella, Costa del Sol"
            value={data.location}
            onChange={(e) => update("location", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Tipo de activo" required>
          <input
            type="text"
            required
            placeholder="Vivienda, local, terreno..."
            value={data.asset_type}
            onChange={(e) => update("asset_type", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Rango de inversion" required>
          <input
            type="text"
            required
            placeholder="500.000 - 800.000 EUR"
            value={data.investment_range}
            onChange={(e) => update("investment_range", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="ROI estimado">
          <input
            type="text"
            placeholder="6-8% anual"
            value={data.roi_estimated || ""}
            onChange={(e) => update("roi_estimated", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Horizonte" required>
          <input
            type="text"
            required
            placeholder="3-5 anos"
            value={data.horizon}
            onChange={(e) => update("horizon", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Notas de riesgo" required>
        <textarea
          required
          rows={4}
          value={data.risk_notes}
          onChange={(e) => update("risk_notes", e.target.value)}
          className={inputClass}
        />
      </Field>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Guardando..." : "Crear borrador"}
        </button>
      </div>
    </form>
  )
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      {children}
    </label>
  )
}
