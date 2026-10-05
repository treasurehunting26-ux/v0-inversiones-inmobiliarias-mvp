/**
 * Cliente API para la vista de leads y conversaciones del panel admin.
 * Todas las llamadas requieren X-Admin-Token, igual que admin-api.ts.
 * Referencia: MVP_TECHNICAL_BLUEPRINT.md (4.4 y 4.5, endpoints "humano")
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export type LeadStatus = "open" | "contacted" | "closed"

export type LeadInvestor = {
  id: string
  name: string | null
  email: string | null
  source: string | null
  qualification_status: string
  budget_range: string | null
  investment_goal: string | null
  horizon: string | null
  risk_profile: string | null
  investor_market: string | null
  preferred_property_market: string | null
  preferred_asset_type: string | null
}

export type Lead = {
  id: string
  reason: string
  status: LeadStatus
  handled_by: string | null
  created_at: string
  investor: LeadInvestor | null
}

export type LeadCounts = Record<LeadStatus, number>

export type ConversationSummary = {
  id: string
  investor_id: string | null
  escalated_to_human: boolean
  intent_score: number | null
  message_count: number
  first_user_message: string | null
  created_at: string
  updated_at: string | null
}

export type ConversationDetail = {
  id: string
  investor_id: string | null
  escalated_to_human: boolean
  intent_score: number | null
  created_at: string
  messages: { role: string; content: string; created_at: string }[]
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Admin-Token": token,
  }
}

async function request<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: authHeaders(token),
      cache: "no-store",
    })
  } catch {
    throw new Error("No se pudo contactar con el servidor. Revisa tu conexion e intentalo de nuevo.")
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error("UNAUTHORIZED")
    const data = await res.json().catch(() => ({}))
    throw new Error(typeof data.detail === "string" ? data.detail : `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function listLeads(token: string): Promise<{ leads: Lead[]; counts: LeadCounts }> {
  return request(token, "/admin/leads")
}

export function updateLeadStatus(
  token: string,
  id: string,
  status: LeadStatus,
  handledBy: string,
): Promise<Lead> {
  return request(token, `/admin/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, handled_by: handledBy }),
  })
}

export function listConversations(
  token: string,
  limit = 50,
): Promise<{ conversations: ConversationSummary[]; total: number }> {
  return request(token, `/admin/conversations?limit=${limit}`)
}

export function getConversation(token: string, id: string): Promise<ConversationDetail> {
  return request(token, `/admin/conversations/${id}`)
}
