const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

export interface ContactPayload {
  name: string
  email: string
  context: string
  /** Idioma en el que escribe el visitante (se muestra al equipo) */
  locale?: string
  /** Solicitud privada: perfil elegido en el panel "Hablar con un asesor" */
  source?: "contact_form" | "private_enquiry"
  investment_goal?: string
  preferred_property_market?: string
  budget_range?: string
}

export interface ContactResponse {
  id: string
  status: string
}

export async function submitContact(
  payload: ContactPayload,
  fallbackError = "No se pudo enviar tu solicitud. Inténtalo de nuevo.",
): Promise<ContactResponse> {
  const res = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let detail = fallbackError
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
