const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

export interface ContactPayload {
  name: string
  email: string
  context: string
}

export interface ContactResponse {
  id: string
  status: string
}

export async function submitContact(payload: ContactPayload): Promise<ContactResponse> {
  const res = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let detail = "No se pudo enviar tu solicitud. Inténtalo de nuevo."
    try {
      const data = await res.json()
      if (typeof data?.detail === "string") detail = data.detail
    } catch {
      // respuesta sin cuerpo JSON; usamos mensaje por defecto
    }
    throw new Error(detail)
  }

  return res.json()
}
