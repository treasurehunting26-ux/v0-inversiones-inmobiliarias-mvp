/**
 * Cliente de Brigitte (asistente virtual).
 * Backend: POST /ai/assistant y POST /ai/assistant/handoff (routers/ai_assistant.py)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

export type BrigitteReply = {
  conversation_id: string
  response: string
  escalate_to_human: boolean
}

/** Error con el mensaje que ya viene redactado para el visitante (ej. limite de mensajes). */
export class BrigitteError extends Error {
  constructor(
    message: string,
    public readonly visitorMessage: string | null,
  ) {
    super(message)
  }
}

async function post<T>(path: string, body: unknown, locale: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Locale": locale },
      body: JSON.stringify(body),
    })
  } catch {
    throw new BrigitteError("NETWORK", null)
  }
  if (!res.ok) {
    let detail: string | null = null
    try {
      const data = await res.json()
      if (typeof data?.detail === "string") detail = data.detail
    } catch {
      detail = null
    }
    // Solo los 429 traen un texto pensado para el visitante.
    throw new BrigitteError(`HTTP_${res.status}`, res.status === 429 ? detail : null)
  }
  return res.json() as Promise<T>
}

export function sendToBrigitte(params: {
  message: string
  conversationId: string | null
  locale: string
  propertyId?: string | null
}): Promise<BrigitteReply> {
  return post<BrigitteReply>(
    "/ai/assistant",
    {
      message: params.message,
      conversation_id: params.conversationId,
      locale: params.locale,
      property_id: params.propertyId ?? null,
    },
    params.locale,
  )
}

export function requestHandoff(params: {
  conversationId: string
  name: string
  email: string
  phone?: string
  locale: string
  propertyId?: string | null
}): Promise<{ id: string | null; status: string }> {
  return post(
    "/ai/assistant/handoff",
    {
      conversation_id: params.conversationId,
      name: params.name,
      email: params.email,
      phone: params.phone || null,
      locale: params.locale,
      property_id: params.propertyId ?? null,
    },
    params.locale,
  )
}
