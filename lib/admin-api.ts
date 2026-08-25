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
): Promise<{ status: string; slugs_assigned: number; slugs_cleaned: number }> {
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
 *
 * Las fotos se redimensionan y recomprimen en el propio navegador antes
 * de subirse: las camaras de movil modernas producen archivos de 8-20 MB,
 * que superaban el limite pensado para fichas de propiedad. Tras la
 * compresion casi siempre pesan 1-3 MB sin perdida visible de calidad.
 *
 * Si algo falla de forma "silenciosa" (red inestable, bloqueo del
 * navegador, etc.) la libreria reintenta internamente hasta 10 veces con
 * espera creciente, lo que puede parecer que la subida se queda colgada
 * varios minutos. Por eso forzamos un limite de tiempo razonable segun el
 * tipo de archivo y abortamos con un mensaje claro si se supera.
 */
export async function uploadMedia(
  token: string,
  file: File,
  kind: "photo" | "video",
): Promise<string> {
  const { upload } = await import("@vercel/blob/client")
  const folder = kind === "photo" ? "propiedades/fotos" : "propiedades/videos"
  const timeoutMs = kind === "photo" ? 30_000 : 120_000

  const uploadFile =
    kind === "photo" ? await (await import("./compress-image")).compressImage(file) : file

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const blob = await upload(`${folder}/${uploadFile.name}`, uploadFile, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
      headers: { "X-Admin-Token": token },
      clientPayload: JSON.stringify({ kind }),
      abortSignal: controller.signal,
    })
    return blob.url
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(
        "La subida esta tardando demasiado. Comprueba tu conexion e intentalo de nuevo, o pega el enlace directamente si ya subiste el archivo.",
      )
    }
    if (err instanceof Error && /too large|maximumSizeInBytes|8388608/.test(err.message)) {
      throw new Error(
        kind === "photo"
          ? "La foto sigue siendo demasiado grande incluso tras comprimirla. Prueba con otra foto o reduce su resolucion antes de subirla."
          : "El video es demasiado grande (maximo 150 MB). Comprimelo antes de subirlo.",
      )
    }
    throw new Error(err instanceof Error ? err.message : "No se pudo subir el archivo")
  } finally {
    clearTimeout(timeoutId)
  }
}
