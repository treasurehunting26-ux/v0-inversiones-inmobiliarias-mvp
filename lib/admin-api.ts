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
  description_html: string | null
  photos: string[] | null
  video_url: string | null
  dossier_slug: string | null
}

export type PropertyContentPayload = {
  description_html?: string
  photos?: string[]
  video_url?: string
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

/**
 * Ejecuta la migracion puntual que anade las columnas de contenido
 * enriquecido (fotos, video, HTML, dossier) a la base de datos.
 * Segura de llamar varias veces: no falla si las columnas ya existen.
 */
export async function migrateContentFields(
  token: string,
): Promise<{ status: string; slugs_assigned: number }> {
  const res = await fetch(`${API_URL}/admin/properties/migrate-content-fields`, {
    method: "POST",
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function updateContent(
  token: string,
  id: string,
  payload: PropertyContentPayload,
): Promise<AdminProperty> {
  const res = await fetch(`${API_URL}/admin/properties/${id}/content`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

/**
 * Sube una foto o video al almacenamiento (Vercel Blob) a traves de la
 * ruta protegida /api/admin/upload y devuelve la URL publica resultante.
 */
export async function uploadMedia(
  token: string,
  file: File,
  kind: "photo" | "video",
): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("kind", kind)

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "X-Admin-Token": token },
    body: formData,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Error ${res.status}`)
  }
  const data = await res.json()
  return data.url as string
}
