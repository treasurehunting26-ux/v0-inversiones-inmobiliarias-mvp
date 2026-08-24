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
  let res: Response
  try {
    res = await fetch(`${API_URL}/admin/properties/${id}/content`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
  } catch {
    // fetch lanza esto cuando la peticion nunca llega a completarse
    // (bloqueo de CORS, backend caido, sin conexion, etc.)
    throw new Error("No se pudo contactar con el servidor. Revisa tu conexion e intentalo de nuevo.")
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || `Error ${res.status}`)
  }
  return res.json()
}

/**
 * Sube una foto o video directamente desde el navegador a Vercel Blob.
 *
 * El archivo NO pasa por nuestro servidor: solo se pide un token corto a
 * /api/admin/upload (ruta protegida con X-Admin-Token) y con ese token el
 * navegador sube el archivo directo al almacenamiento. Esto evita el
 * limite de ~4.5 MB que tienen las funciones serverless de Vercel para el
 * cuerpo de la peticion, que antes causaba error 413 en fotos y videos.
 */
export async function uploadMedia(
  token: string,
  file: File,
  kind: "photo" | "video",
): Promise<string> {
  const { upload } = await import("@vercel/blob/client")
  const folder = kind === "photo" ? "propiedades/fotos" : "propiedades/videos"

  try {
    const blob = await upload(`${folder}/${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
      headers: { "X-Admin-Token": token },
      clientPayload: JSON.stringify({ kind }),
    })
    return blob.url
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "No se pudo subir el archivo")
  }
}
