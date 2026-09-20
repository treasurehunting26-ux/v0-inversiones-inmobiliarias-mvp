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
  justification: string | null
  criteria_matched: string | null
  status: "pending_review" | "approved" | "discarded"
  investor_id: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
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
