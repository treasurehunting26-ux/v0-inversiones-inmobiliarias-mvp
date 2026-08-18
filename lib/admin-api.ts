/**
 * Cliente API para el panel admin.
 * Todas las llamadas requieren X-Admin-Token.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export type AdminProperty = {
  id: string
  title: string
  location: string
  asset_type: string
  investment_range: string
  roi_estimated: string | null
  horizon: string
  risk_notes: string
  status: "draft" | "published" | "archived"
  created_by: string
  approved_by: string | null
  created_at: string
  updated_at: string
}

export type PropertyCreatePayload = {
  title: string
  location: string
  asset_type: string
  investment_range: string
  horizon: string
  risk_notes: string
  roi_estimated?: string
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Admin-Token": token,
  }
}

export async function listProperties(token: string): Promise<AdminProperty[]> {
  const res = await fetch(`${API_URL}/admin/properties`, {
    headers: authHeaders(token),
    cache: "no-store",
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error("UNAUTHORIZED")
    throw new Error(`Error ${res.status}`)
  }
  const data = await res.json()
  return data.properties as AdminProperty[]
}

export async function createProperty(
  token: string,
  payload: PropertyCreatePayload,
): Promise<AdminProperty> {
  const res = await fetch(`${API_URL}/admin/properties`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function updateStatus(
  token: string,
  id: string,
  status: AdminProperty["status"],
): Promise<AdminProperty> {
  const res = await fetch(`${API_URL}/admin/properties/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function deleteProperty(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/properties/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  })
  if (!res.ok && res.status !== 204) throw new Error(`Error ${res.status}`)
}
