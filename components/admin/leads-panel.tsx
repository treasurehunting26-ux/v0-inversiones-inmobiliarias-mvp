"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { CheckCircle2, ChevronDown, ChevronUp, Mail, MessageSquare, PhoneCall, RefreshCw, RotateCcw } from "lucide-react"
import {
  type ConversationDetail,
  type ConversationSummary,
  type Lead,
  type LeadCounts,
  type LeadStatus,
  getConversation,
  listConversations,
  listLeads,
  updateLeadStatus,
} from "@/lib/leads-api"

interface LeadsPanelProps {
  token: string
  onUnauthorized: () => void
}

type Filter = LeadStatus | "all"

const OPERATOR_KEY = "admin_operator_name"

const STATUS_LABELS: Record<LeadStatus, string> = {
  open: "Abierto",
  contacted: "Contactado",
  closed: "Cerrado",
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: "open", label: "Abiertos" },
  { value: "contacted", label: "Contactados" },
  { value: "closed", label: "Cerrados" },
  { value: "all", label: "Todos" },
]

function readOperator(): string {
  try {
    return window.localStorage.getItem(OPERATOR_KEY) ?? ""
  } catch {
    return ""
  }
}

function saveOperator(name: string) {
  try {
    window.localStorage.setItem(OPERATOR_KEY, name)
  } catch {
    // Sin almacenamiento disponible: el nombre solo dura esta sesion.
  }
}

function leadOrigin(lead: Lead): string {
  if (lead.reason.includes("Escalado desde el asistente")) return "Asistente de IA"
  if (lead.investor?.source === "contact_form") return "Formulario de contacto"
  return lead.investor?.source ?? "Desconocido"
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })
}

export function LeadsPanel({ token, onUnauthorized }: LeadsPanelProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [counts, setCounts] = useState<LeadCounts>({ open: 0, contacted: 0, closed: 0 })
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [conversationTotal, setConversationTotal] = useState(0)
  const [filter, setFilter] = useState<Filter>("open")
  const [operator, setOperator] = useState("")
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setOperator(readOperator())
  }, [])

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const [leadData, conversationData] = await Promise.all([
        listLeads(token),
        listConversations(token),
      ])
      setLeads(leadData.leads)
      setCounts(leadData.counts)
      setConversations(conversationData.conversations)
      setConversationTotal(conversationData.total)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error"
      if (msg === "UNAUTHORIZED") onUnauthorized()
      else setError("Error al cargar los leads")
    } finally {
      setLoading(false)
    }
  }, [token, onUnauthorized])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleStatus(lead: Lead, status: LeadStatus) {
    const name = operator.trim()
    if (!name) {
      setError("Escribe tu nombre en «Gestionado por» antes de cambiar el estado de un lead.")
      return
    }
    setError(null)
    setActioningId(lead.id)
    try {
      const updated = await updateLeadStatus(token, lead.id, status, name)
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      setCounts((prev) => ({ ...prev, [lead.status]: prev[lead.status] - 1, [status]: prev[status] + 1 }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error"
      if (msg === "UNAUTHORIZED") onUnauthorized()
      else setError(`No se pudo actualizar el lead: ${msg}`)
    } finally {
      setActioningId(null)
    }
  }

  const visible = filter === "all" ? leads : leads.filter((l) => l.status === filter)
  const total = counts.open + counts.contacted + counts.closed

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Inversores que han pedido hablar con un asesor</p>
          <p className="text-xs text-muted-foreground text-pretty">
            Llegan desde el formulario de contacto y desde el asistente de IA. Cambiar el estado no envía
            ninguna comunicación: solo registra quién lo gestionó.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Gestionado por
            <input
              value={operator}
              onChange={(e) => {
                setOperator(e.target.value)
                saveOperator(e.target.value)
              }}
              placeholder="Tu nombre"
              maxLength={120}
              className="w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <button
            onClick={() => {
              setLoading(true)
              refresh()
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            aria-label="Recargar"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">Leads ({total})</h2>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const n = f.value === "all" ? total : counts[f.value]
              const active = filter === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label} · {n}
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {filter === "open" ? "No hay leads abiertos pendientes de gestionar." : "No hay leads en este estado."}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                busy={actioningId === lead.id}
                onStatus={(status) => handleStatus(lead, status)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-1 font-serif text-xl font-semibold text-foreground">
          Conversaciones del asistente ({conversationTotal})
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Todas las conversaciones, aunque no hayan pedido contacto. Solo lectura.
          {conversationTotal > conversations.length && ` Se muestran las ${conversations.length} más recientes.`}
        </p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay conversaciones.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((c) => (
              <ConversationRow key={c.id} token={token} summary={c} onUnauthorized={onUnauthorized} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function LeadCard({
  lead,
  busy,
  onStatus,
}: {
  lead: Lead
  busy: boolean
  onStatus: (status: LeadStatus) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const inv = lead.investor
  const long = lead.reason.length > 400
  const profile = [
    ["Presupuesto", inv?.budget_range],
    ["Objetivo", inv?.investment_goal],
    ["Horizonte", inv?.horizon],
    ["Mercado de interés", inv?.preferred_property_market],
    ["Tipo de activo", inv?.preferred_asset_type],
  ].filter(([, v]) => v) as [string, string][]

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{inv?.name || "Sin nombre"}</p>
          {inv?.email && (
            <a
              href={`mailto:${inv.email}`}
              className="inline-flex items-center gap-1 break-all text-sm text-primary hover:underline"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {inv.email}
            </a>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {leadOrigin(lead)} · {formatDate(lead.created_at)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <LeadBadge status={lead.status} />
          {lead.handled_by && <p className="text-xs text-muted-foreground">Gestionado por {lead.handled_by}</p>}
        </div>
      </div>

      {profile.length > 0 && (
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {profile.map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="text-muted-foreground">{label}:</dt>
              <dd className="text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-3 rounded-md border border-border bg-muted/40 p-3">
        <p
          className={`whitespace-pre-wrap break-words text-sm text-foreground ${
            long && !expanded ? "line-clamp-6" : ""
          }`}
        >
          {lead.reason}
        </p>
        {long && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Ver menos" : "Ver todo"}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {lead.status === "open" && (
          <ActionButton busy={busy} onClick={() => onStatus("contacted")}>
            <PhoneCall className="h-4 w-4" /> Marcar contactado
          </ActionButton>
        )}
        {lead.status !== "closed" && (
          <ActionButton busy={busy} onClick={() => onStatus("closed")}>
            <CheckCircle2 className="h-4 w-4" /> Cerrar
          </ActionButton>
        )}
        {lead.status === "closed" && (
          <ActionButton busy={busy} onClick={() => onStatus("open")}>
            <RotateCcw className="h-4 w-4" /> Reabrir
          </ActionButton>
        )}
      </div>
    </div>
  )
}

function ConversationRow({
  token,
  summary,
  onUnauthorized,
}: {
  token: string
  summary: ConversationSummary
  onUnauthorized: () => void
}) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next && !detail) {
      setError(null)
      try {
        setDetail(await getConversation(token, summary.id))
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error"
        if (msg === "UNAUTHORIZED") onUnauthorized()
        else setError("No se pudo cargar la conversación")
      }
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        onClick={toggle}
        className="flex w-full items-start justify-between gap-3 p-3 text-left transition-colors hover:bg-muted/40"
      >
        <div className="flex min-w-0 items-start gap-3">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">
              {summary.first_user_message || "(sin mensajes del visitante)"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(summary.updated_at || summary.created_at)} · {summary.message_count} mensajes
              {summary.escalated_to_human && " · escalada"}
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t border-border p-3">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!detail && !error && <p className="text-sm text-muted-foreground">Cargando...</p>}
          {detail?.messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "self-end bg-primary/10 text-foreground"
                  : "self-start bg-muted text-foreground"
              }`}
            >
              <p className="mb-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                {m.role === "user" ? "Visitante" : "Asistente"}
              </p>
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ActionButton({
  busy,
  onClick,
  children,
}: {
  busy: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
    >
      {children}
    </button>
  )
}

function LeadBadge({ status }: { status: LeadStatus }) {
  const tone =
    status === "open"
      ? "bg-primary text-primary-foreground"
      : status === "contacted"
        ? "bg-muted text-foreground"
        : "border border-border text-muted-foreground"
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{STATUS_LABELS[status]}</span>
}
