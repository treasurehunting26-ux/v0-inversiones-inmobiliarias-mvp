"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, OctagonX, RefreshCw } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { type AiUsageReport, getAiUsage } from "@/lib/admin-api"

interface AiCostPanelProps {
  token: string
  onUnauthorized: () => void
}

// Paleta validada (scripts/validate_palette.js de la guia dataviz, superficie #ffffff):
// lightness, croma, separacion daltonismo (ΔE 21.3) y contraste >= 3:1 -> PASS.
const SERIES = {
  assistant: { label: "Brigitte", color: "#b5791c" },
  prospecting: { label: "Agente Captador", color: "#3a6ea5" },
} as const

const PERIODS = [7, 30, 90]

/**
 * Importe en USD con la precision que necesita: los costes por llamada son
 * fracciones de centimo, asi que por debajo de 1 $ se muestran hasta 4
 * decimales (sin ceros sobrantes) en vez de redondear a $0.01.
 */
function usd(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  if (value === 0) return "$0"
  if (value >= 1) return `$${value.toFixed(2)}`
  if (value < 0.0001) return "<$0.0001"
  const text = value.toFixed(4).replace(/0+$/, "")
  return `$${text.endsWith(".") ? `${text}00` : text.split(".")[1].length < 2 ? `${text}0` : text}`
}

function pct(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  return `${(value * 100).toFixed(value < 0.1 ? 1 : 0)}%`
}

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

export function AiCostPanel({ token, onUnauthorized }: AiCostPanelProps) {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<AiUsageReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await getAiUsage(token, days))
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error"
      if (msg === "UNAUTHORIZED") onUnauthorized()
      else setError("No se pudieron cargar las métricas de coste")
    } finally {
      setLoading(false)
    }
  }, [token, days, onUnauthorized])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div className="flex flex-col gap-8">
      {/* Filtros en una sola fila sobre los graficos */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-muted-foreground text-pretty">
          Coste real de la IA (lo informa el AI Gateway en cada llamada). Sirve para decidir si escalar
          o apagar cada funcionalidad, como exige la guía de costes.
        </p>
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setDays(p)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                days === p
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {p} días
            </button>
          ))}
          <button
            onClick={refresh}
            aria-label="Recargar"
            className="inline-flex items-center rounded-lg border border-border px-2.5 py-1.5 text-foreground hover:bg-muted"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-foreground">{error}</div>
      )}

      {data && (
        <>
          <BudgetCard budget={data.budget} />

          <section>
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">Brigitte (asistente)</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Coste por conversación" value={usd(data.assistant.cost_per_conversation)} />
              <Stat label="Coste por inversor cualificado" value={usd(data.assistant.cost_per_qualified)} />
              <Stat label="Coste por lead" value={usd(data.assistant.cost_per_lead)} />
              <Stat label="Pasan a una persona" value={pct(data.assistant.handoff_rate)} />
              <Stat label="Conversaciones" value={String(data.assistant.conversations)} />
              <Stat label="Inversores cualificados" value={String(data.assistant.qualified_investors)} />
              <Stat label="Leads de Brigitte" value={String(data.assistant.leads)} hint={`${data.all_leads} en total`} />
              <Stat label="Gasto del periodo" value={usd(data.assistant.cost_usd)} />
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">Agente Captador</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Gasto del periodo" value={usd(data.prospecting.cost_usd)} />
              <Stat label="Noticias analizadas" value={String(data.prospecting.calls)} />
              <Stat label="Coste por señal" value={usd(data.prospecting.cost_per_signal)} hint={`${data.prospecting.signals} señales`} />
              <Stat label="Coste por señal aprobada" value={usd(data.prospecting.cost_per_approved)} hint={`${data.prospecting.approved} aprobadas`} />
            </div>
          </section>

          <section>
            <h2 className="mb-1 font-serif text-xl font-semibold text-foreground">Gasto diario</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              {usd(data.totals.cost_usd)} en {data.period.days} días · {data.totals.calls} llamadas al modelo
              {data.totals.estimated_calls > 0 && ` · ${data.totals.estimated_calls} con coste estimado`}
            </p>
            <DailyChart daily={data.daily} />
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Ver como tabla
              </summary>
              <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Día</th>
                      <th className="px-3 py-2 text-right">{SERIES.assistant.label}</th>
                      <th className="px-3 py-2 text-right">{SERIES.prospecting.label}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[...data.daily].reverse().map((d) => (
                      <tr key={d.date}>
                        <td className="px-3 py-1.5 text-foreground">{shortDate(d.date)}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-foreground">{usd(d.assistant)}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-foreground">{usd(d.prospecting)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>
        </>
      )}
    </div>
  )
}

function BudgetCard({ budget }: { budget: AiUsageReport["budget"] }) {
  const state = {
    ok: { icon: CheckCircle2, label: "Dentro del presupuesto" },
    warning: { icon: AlertTriangle, label: "Por encima del 80 % del presupuesto" },
    exhausted: {
      icon: OctagonX,
      label: budget.hard_stop
        ? "Presupuesto agotado: la IA está en pausa hasta el mes que viene (Brigitte ofrece el contacto con el equipo)"
        : "Presupuesto agotado (el corte automático está desactivado)",
    },
  }[budget.state]
  const Icon = state.icon
  const width = Math.min(budget.ratio, 1) * 100

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Gasto de este mes</p>
        <p className="text-xs text-muted-foreground">desde el {shortDate(budget.month_start)}</p>
      </div>
      <p className="mt-1 font-serif text-3xl font-semibold text-foreground">
        {usd(budget.spent_usd)} <span className="text-base font-normal text-muted-foreground">de {usd(budget.budget_usd)}</span>
      </p>
      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(budget.ratio * 100)}
        aria-label="Presupuesto mensual consumido"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm text-foreground">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {state.label} · {pct(budget.ratio)}
      </p>
    </section>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function DailyChart({ daily }: { daily: AiUsageReport["daily"] }) {
  return (
    <div className="h-64 w-full rounded-lg border border-border bg-card p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={daily} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="20%">
          <CartesianGrid vertical={false} stroke="#ece6da" />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ fontSize: 11, fill: "#6b6457" }}
            tickLine={false}
            axisLine={{ stroke: "#ddd6c8" }}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(v: number) => usd(v)}
            tick={{ fontSize: 11, fill: "#6b6457" }}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            cursor={{ fill: "rgba(20,18,14,0.05)" }}
            formatter={(value: number, name: string) => [usd(value), name]}
            labelFormatter={(label: string) => shortDate(label)}
            contentStyle={{ borderRadius: 8, border: "1px solid #ddd6c8", fontSize: 12, color: "#1c1a16" }}
            itemStyle={{ color: "#1c1a16" }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value: string) => <span style={{ color: "#1c1a16" }}>{value}</span>}
          />
          <Bar
            dataKey="prospecting"
            name={SERIES.prospecting.label}
            stackId="cost"
            fill={SERIES.prospecting.color}
            stroke="#ffffff"
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Bar
            dataKey="assistant"
            name={SERIES.assistant.label}
            stackId="cost"
            fill={SERIES.assistant.color}
            stroke="#ffffff"
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
