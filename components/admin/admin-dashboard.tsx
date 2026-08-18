"use client"

import { useCallback, useEffect, useState } from "react"
import { LogOut, Plus, X } from "lucide-react"
import {
  AdminProperty,
  listProperties,
} from "@/lib/admin-api"
import { PropertyForm } from "./property-form"
import { PropertyList } from "./property-list"

interface AdminDashboardProps {
  token: string
  onLogout: () => void
}

export function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const items = await listProperties(token)
      setProperties(items)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error"
      if (msg === "UNAUTHORIZED") onLogout()
      else setError("Error al cargar propiedades")
    } finally {
      setLoading(false)
    }
  }, [token, onLogout])

  useEffect(() => {
    refresh()
  }, [refresh])

  const counts = {
    total: properties.length,
    published: properties.filter((p) => p.status === "published").length,
    drafts: properties.filter((p) => p.status === "draft").length,
    archived: properties.filter((p) => p.status === "archived").length,
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10 flex items-start justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            Propiedades
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestion manual del catalogo. Solo las propiedades publicadas son
            visibles para los inversionistas.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Cerrar sesion"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total" value={counts.total} />
        <StatCard label="Publicadas" value={counts.published} />
        <StatCard label="Borradores" value={counts.drafts} />
        <StatCard label="Archivadas" value={counts.archived} />
      </section>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Catalogo
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Cerrar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Nueva propiedad
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <PropertyForm
            token={token}
            onCreated={() => {
              setShowForm(false)
              refresh()
            }}
          />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <PropertyList
          token={token}
          properties={properties}
          onChanged={refresh}
        />
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl font-semibold text-foreground">
        {value}
      </p>
    </div>
  )
}
