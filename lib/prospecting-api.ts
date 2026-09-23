/**
 * Cliente API para el panel de Agente Captador (prospecting).
 * Todas las llamadas requieren X-Admin-Token, igual que admin-api.ts.
 * Referencia: FASE2_AGENTE_CAPTADOR.md
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export type ProspectingSignal = {
  id: string
  source: string
  source_url: string | null
  title: string
  snippet: string
  score: number
  confidence: number | null
  justification: string | null
  criteria_matched: string | null
  status: "pending_review" | "approved" | "discarded"
  investor_id: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  // Mercado del INVERSOR: dónde está, no dónde quiere invertir.
  investor_market: string | null
  investor_country: string | null
  investor_city: string | null
  language: string | null
  estimated_investment_capacity: string | null
  // Mercado del ACTIVO preferido: dónde quiere invertir. Independiente
  // del mercado del inversor — nunca deben confundirse.
  preferred_property_market: string | null
  preferred_asset_type: string | null
}

export type ProspectingFollowUp = {
  id: string
  investor_id: string
  signal_id: string
  reason: string
  status: "pending" | "done"
  created_at: string
  completed_at: string | null
  completed_by: string | null
}

export type ProspectingRunLog = {
  id: string
  started_at: string
  finished_at: string | null
  sources_checked: string
  signals_found: number
  signals_qualified: number
  status: string
  error_detail: string | null
}

export type ProspectingSource = {
  id: string
  name: string
  url: string
  source_type: "rss" | "atom" | "official_api" | "public_feed" | "other_approved"
  country: string | null
  city: string | null
  region: string | null
  language: string | null
  // Mercado del INVERSOR que suele aportar la fuente (audiencia/tráfico).
  investor_market: string | null
  // Mercado del ACTIVO que cubre la fuente. Independiente del anterior —
  // nunca se asume que ambos coinciden.
  property_market: string | null
  priority: number
  legal_status: string
  active: boolean
  last_checked_at: string | null
  created_at: string
  updated_at: string
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Admin-Token": token,
  }
}

export async function listSignals(token: string): Promise<ProspectingSignal[]> {
  const res = await fetch(`${API_URL}/prospecting/signals`, {
    headers: authHeaders(token),
    cache: "no-store",
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error("UNAUTHORIZED")
    throw new Error(`Error ${res.status}`)
  }
  const data = await res.json()
  return data.signals as ProspectingSignal[]
}

export async function listRuns(token: string): Promise<ProspectingRunLog[]> {
  const res = await fetch(`${API_URL}/prospecting/runs`, {
    headers: authHeaders(token),
    cache: "no-store",
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error("UNAUTHORIZED")
    throw new Error(`Error ${res.status}`)
  }
  const data = await res.json()
  return data.runs as ProspectingRunLog[]
}

export async function runProspectingCycle(
  token: string,
): Promise<{ signals_found: number; signals_qualified: number }> {
  const res = await fetch(`${API_URL}/prospecting/run`, {
    method: "POST",
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function approveSignal(token: string, id: string): Promise<ProspectingSignal> {
  const res = await fetch(`${API_URL}/prospecting/signals/${id}/approve`, {
    method: "POST",
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function discardSignal(token: string, id: string): Promise<ProspectingSignal> {
  const res = await fetch(`${API_URL}/prospecting/signals/${id}/discard`, {
    method: "POST",
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function listFollowUps(token: string): Promise<ProspectingFollowUp[]> {
  const res = await fetch(`${API_URL}/prospecting/followups`, {
    headers: authHeaders(token),
    cache: "no-store",
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error("UNAUTHORIZED")
    throw new Error(`Error ${res.status}`)
  }
  const data = await res.json()
  return data.followups as ProspectingFollowUp[]
}

export async function completeFollowUp(token: string, id: string): Promise<ProspectingFollowUp> {
  const res = await fetch(`${API_URL}/prospecting/followups/${id}/complete`, {
    method: "POST",
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function listSources(token: string): Promise<ProspectingSource[]> {
  const res = await fetch(`${API_URL}/prospecting/sources`, {
    headers: authHeaders(token),
    cache: "no-store",
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error("UNAUTHORIZED")
    throw new Error(`Error ${res.status}`)
  }
  const data = await res.json()
  return data.sources as ProspectingSource[]
}

export async function activateSource(token: string, id: string): Promise<ProspectingSource> {
  const res = await fetch(`${API_URL}/prospecting/sources/${id}/activate`, {
    method: "POST",
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function deactivateSource(token: string, id: string): Promise<ProspectingSource> {
  const res = await fetch(`${API_URL}/prospecting/sources/${id}/deactivate`, {
    method: "POST",
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}
