"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, ClipboardCheck, PlayCircle, ShieldAlert, Trash2 } from "lucide-react"
import {
  type ProspectingFollowUp,
  type ProspectingRunLog,
  type ProspectingSignal,
  approveSignal,
  completeFollowUp,
  discardSignal,
  listFollowUps,
  listRuns,
  listSignals,
  runProspectingCycle,
} from "@/lib/prospecting-api"

interface ProspectingPanelProps {
  token: string
  onUnauthorized: () => void
}

export function ProspectingPanel({ token, onUnauthorized }: ProspectingPanelProps) {
  const [signals, setSignals] = useState<ProspectingSignal[]>([])
  const [runs, setRuns] = useState<ProspectingRunLog[]>([])
  const [followups, setFollowUps] = useState<ProspectingFollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [runResult, setRunResult] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const [signalItems, runItems, followUpItems] = await Promise.all([
        listSignals(token),
        listRuns(token),
        listFollowUps(token),
      ])
      setSignals(signalItems)
      setRuns(runItems)
      setFollowUps(followUpItems)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error"
      if (msg === "UNAUTHORIZED") onUnauthorized()
      else setError("Error al cargar las señales de captación")
    } finally {
      setLoading(false)
    }
  }, [token, onUnauthorized])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleRunNow() {
    setRunning(true)
    setRunResult(null)
    try {
      const result = await runProspectingCycle(token)
      setRunResult(
        `Ciclo completado: ${result.signals_found} señales revisadas, ${result.signals_qualified} cualificadas (score >= 60).`,
      )
      refresh()
    } catch {
      setRunResult("No se pudo ejecutar el ciclo de captación. Intenta de nuevo en unos segundos.")
    } finally {
      setRunning(false)
    }
  }

  async function handleApprove(id: string) {
    setActioningId(id)
    try {
      await approveSignal(token, id)
      refresh()
    } catch {
      setError("No se pudo aprobar la señal. Intenta de nuevo.")
    } finally {
      setActioningId(null)
    }
  }

  async function handleDiscard(id: string) {
    setActioningId(id)
    try {
      await discardSignal(token, id)
      refresh()
    } catch {
      setError("No se pudo descartar la señal. Intenta de nuevo.")
    } finally {
      setActioningId(null)
    }
  }

  async function handleCompleteFollowUp(id: string) {
    setActioningId(id)
    try {
      await completeFollowUp(token, id)
      refresh()
    } catch {
      setError("No se pudo marcar el seguimiento como completado. Intenta de nuevo.")
    } finally {
      setActioningId(null)
    }
  }

  const pending = signals.filter((s) => s.status === "pending_review")
  const reviewed = signals.filter((s) => s.status !== "pending_review")
  const pendingFollowUps = followups.filter((f) => f.status === "pending")
  const doneFollowUps = followups.filter((f) => f.status !== "pending")

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            Fuentes activas: Google Alerts (RSS) y RSS de foros especializados.
          </p>
          <p className="mt-1 text-pretty">
            LinkedIn y Facebook están explícitamente fuera de alcance de esta versión por riesgo legal
            (Términos de Servicio y GDPR) — pendiente de revisión legal antes de activarse. El agente nunca
            contacta a nadie ni crea inversores por si solo: cada señal requiere tu aprobación explícita.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Ciclo de captación</p>
          <p className="text-xs text-muted-foreground">
            Se ejecuta automáticamente cada noche. También puedes lanzarlo ahora manualmente.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            onClick={handleRunNow}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <PlayCircle className={`h-4 w-4 ${running ? "animate-pulse" : ""}`} />
            {running ? "Ejecutando..." : "Ejecutar ahora"}
          </button>
          {runResult && <p className="text-xs text-muted-foreground text-right">{runResult}</p>}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
          Señales pendientes de revisión ({pending.length})
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay señales pendientes. Ejecuta el ciclo o espera a la próxima ejecución nocturna.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {pending.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                busy={actioningId === signal.id}
                onApprove={() => handleApprove(signal.id)}
                onDiscard={() => handleDiscard(signal.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
          Seguimiento pendiente ({pendingFollowUps.length})
        </h2>
        <p className="mb-4 -mt-2 text-xs text-muted-foreground text-pretty">
          Investors cualificados por el Agente Captador que aún esperan seguimiento manual. Marcar como
          contactado no envía ninguna comunicación: solo registra que ya lo gestionaste por tu cuenta.
        </p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : pendingFollowUps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay seguimientos pendientes.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingFollowUps.map((followup) => (
              <div
                key={followup.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Investor {followup.investor_id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-foreground text-pretty">{followup.reason}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(followup.created_at).toLocaleString("es-ES")}
                  </p>
                </div>
                <button
                  onClick={() => handleCompleteFollowUp(followup.id)}
                  disabled={actioningId === followup.id}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Marcar como contactado
                </button>
              </div>
            ))}
          </div>
        )}
        {doneFollowUps.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            {doneFollowUps.length} seguimiento(s) ya completado(s).
          </p>
        )}
      </section>

      {reviewed.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">Historial de revisión</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Fuente</th>
                  <th className="px-4 py-2">Score</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Revisado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reviewed.map((signal) => (
                  <tr key={signal.id}>
                    <td className="px-4 py-2 text-foreground">{signal.source}</td>
                    <td className="px-4 py-2 text-foreground">{signal.score}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={signal.status} />
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {signal.reviewed_at ? new Date(signal.reviewed_at).toLocaleString("es-ES") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {runs.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
            Historial de ejecuciones (auditoría)
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Fuentes consultadas</th>
                  <th className="px-4 py-2">Revisadas</th>
                  <th className="px-4 py-2">Cualificadas</th>
                  <th className="px-4 py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td className="px-4 py-2 text-muted-foreground">
                      {new Date(run.started_at).toLocaleString("es-ES")}
                    </td>
                    <td className="px-4 py-2 text-foreground">{run.sources_checked}</td>
                    <td className="px-4 py-2 text-foreground">{run.signals_found}</td>
                    <td className="px-4 py-2 text-foreground">{run.signals_qualified}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={run.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

function SignalCard({
  signal,
  busy,
  onApprove,
  onDiscard,
}: {
  signal: ProspectingSignal
  busy: boolean
  onApprove: () => void
  onDiscard: () => void
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{signal.source}</p>
          <h3 className="font-serif text-lg font-semibold text-foreground text-pretty">{signal.title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          Score {signal.score}
        </span>
      </div>

      <p className="mt-3 text-sm text-muted-foreground text-pretty">{signal.snippet}</p>

      {signal.justification && (
        <p className="mt-3 text-sm text-foreground text-pretty">
          <span className="font-medium">{"Justificación IA: "}</span>
          {signal.justification}
        </p>
      )}

      {signal.criteria_matched && (
        <p className="mt-1 text-xs text-muted-foreground">Criterios detectados: {signal.criteria_matched}</p>
      )}

      {signal.source_url && (
        <a
          href={signal.source_url}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-2 inline-block text-xs text-primary underline"
        >
          Ver fuente original
        </a>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={onApprove}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          Aprobar e iniciar seguimiento
        </button>
        <button
          onClick={onDiscard}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Descartar
        </button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "approved"
      ? "Aprobada"
      : status === "discarded"
        ? "Descartada"
        : status === "success"
          ? "OK"
          : status === "error"
            ? "Error"
            : status

  const tone =
    status === "approved" || status === "success"
      ? "bg-primary/10 text-primary"
      : status === "discarded"
        ? "bg-muted text-muted-foreground"
        : "bg-destructive/10 text-destructive"

  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{label}</span>
}
