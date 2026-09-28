"use client"

import { useCallback, useEffect, useState } from "react"
import { PowerOff, Radio } from "lucide-react"
import {
  type ProspectingSource,
  activateSource,
  deactivateSource,
  listSources,
} from "@/lib/prospecting-api"

interface ProspectingSourcesPanelProps {
  token: string
  onUnauthorized: () => void
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  rss: "RSS",
  atom: "Atom",
  official_api: "API oficial",
  public_feed: "Feed público",
  other_approved: "Otro (aprobado)",
}

export function ProspectingSourcesPanel({ token, onUnauthorized }: ProspectingSourcesPanelProps) {
  const [sources, setSources] = useState<ProspectingSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const items = await listSources(token)
      setSources(items)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error"
      if (msg === "UNAUTHORIZED") onUnauthorized()
      else setError("Error al cargar las fuentes de captación")
    } finally {
      setLoading(false)
    }
  }, [token, onUnauthorized])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleToggle(source: ProspectingSource) {
    setTogglingId(source.id)
    try {
      if (source.active) {
        await deactivateSource(token, source.id)
      } else {
        await activateSource(token, source.id)
      }
      refresh()
    } catch {
      setError("No se pudo cambiar el estado de la fuente. Intenta de nuevo.")
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-start gap-3">
        <Radio className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Fuentes de captación ({sources.length})
          </h2>
          <p className="text-xs text-muted-foreground text-pretty">
            Fuentes RSS/Atom activas del Agente Captador. Desactivar una fuente aquí impide que el
            próximo ciclo la consulte; no borra su historial ni afecta señales ya generadas.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : sources.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay fuentes registradas. Se configuran mediante la API administrativa
          (POST /prospecting/sources) o migrando las fuentes existentes.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Fuente</th>
                <th className="px-4 py-2">País</th>
                <th className="px-4 py-2">Mercado inversor</th>
                <th className="px-4 py-2">Mercado inmobiliario</th>
                <th className="px-4 py-2">Idioma</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Prioridad</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Última ejecución</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sources.map((source) => (
                <tr key={source.id}>
                  <td className="px-4 py-2 text-foreground">{source.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{source.country ?? "-"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{source.investor_market ?? "-"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{source.property_market ?? "-"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{source.language ?? "-"}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {SOURCE_TYPE_LABELS[source.source_type] ?? source.source_type}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{source.priority}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        source.active
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {source.active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {source.last_checked_at
                      ? new Date(source.last_checked_at).toLocaleString("es-ES")
                      : "Nunca"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleToggle(source)}
                      disabled={togglingId === source.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    >
                      <PowerOff className="h-3.5 w-3.5" />
                      {source.active ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
