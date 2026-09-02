"use client"

import { useState, useRef, useEffect } from "react"
import { submitContact } from "@/lib/contact-api"

interface Message {
  role: "user" | "assistant"
  content: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function sendMessage(message: string, conversationId: string | null) {
  const res = await fetch(`${API_URL}/ai/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversation_id: conversationId }),
  })
  if (!res.ok) {
    // El backend envía un mensaje explicativo en `detail` (por ejemplo al
    // alcanzar el límite de mensajes). Lo propagamos para mostrarlo tal cual
    // en lugar de un error genérico que desorientaría al visitante.
    let detail = ""
    try {
      detail = (await res.json())?.detail ?? ""
    } catch {
      detail = ""
    }
    throw new Error(detail || "API error")
  }
  return res.json()
}

/**
 * Construye una transcripcion legible de la conversacion para enviarla
 * como contexto al endpoint /contact cuando el asistente detecta
 * intencion real de hablar con un humano.
 */
function buildTranscript(messages: Message[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "Visitante" : "Asistente"}: ${m.content}`)
    .join("\n")
    .slice(-1800) // limite del campo `context` en el backend (2000 caracteres)
}

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bienvenido. Soy su asesor especializado en inversiones inmobiliarias. ¿Cuál es su perfil de inversión y qué tipo de activos le interesan?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Escalado a humano: cuando el asistente detecta intencion real de
  // hablar con un asesor, pedimos nombre y correo antes de notificar
  // al equipo (ver backend/routers/contact.py + backend/emailer.py).
  const [escalationState, setEscalationState] = useState<"idle" | "collecting" | "submitting" | "submitted">(
    "idle",
  )
  const [escalationName, setEscalationName] = useState("")
  const [escalationEmail, setEscalationEmail] = useState("")
  const [escalationError, setEscalationError] = useState<string | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, escalationState])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setLoading(true)

    try {
      const data = await sendMessage(text, conversationId)
      if (data.conversation_id) setConversationId(data.conversation_id)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response ?? data.message ?? "Sin respuesta." },
      ])
      if (data.escalate_to_human && escalationState === "idle") {
        setEscalationState("collecting")
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : ""
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            detail && detail !== "API error"
              ? detail
              : "El asesor no está disponible temporalmente. Por favor, inténtelo de nuevo en unos minutos.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleEscalationSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = escalationName.trim()
    const email = escalationEmail.trim()
    if (!name || !email) {
      setEscalationError("Por favor completa tu nombre y correo.")
      return
    }

    setEscalationError(null)
    setEscalationState("submitting")

    try {
      await submitContact({
        name,
        email,
        context: `Escalado desde el asistente de IA. Conversación:\n${buildTranscript(messages)}`,
      })
      setEscalationState("submitted")
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Gracias, ${name}. Un asesor de B&G Consulting se pondrá en contacto contigo a ${email} a la brevedad.`,
        },
      ])
    } catch (err) {
      setEscalationState("collecting")
      setEscalationError(
        err instanceof Error ? err.message : "No se pudo enviar tu solicitud. Inténtalo de nuevo.",
      )
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // No enviar mientras un IME (chino/japonés/coreano) confirma composición.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Historial */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-5 py-3.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "rounded-2xl rounded-br-sm bg-[var(--color-noir)] text-[var(--color-noir-foreground)]"
                  : "rounded-2xl rounded-bl-sm border border-border bg-card text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        {escalationState === "collecting" || escalationState === "submitting" ? (
          <div className="flex justify-start">
            <form
              onSubmit={handleEscalationSubmit}
              className="max-w-[85%] space-y-3 rounded-2xl rounded-bl-sm border border-border bg-card px-5 py-4"
            >
              <p className="text-sm leading-relaxed text-foreground">
                Para que un asesor de B&amp;G Consulting te contacte, compárteme tu nombre y correo.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={escalationName}
                  onChange={(e) => setEscalationName(e.target.value)}
                  placeholder="Nombre completo"
                  disabled={escalationState === "submitting"}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                />
                <input
                  type="email"
                  value={escalationEmail}
                  onChange={(e) => setEscalationEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  disabled={escalationState === "submitting"}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                />
              </div>
              {escalationError && <p className="text-xs text-destructive">{escalationError}</p>}
              <button
                type="submit"
                disabled={escalationState === "submitting"}
                className="w-full rounded-lg bg-[var(--color-noir)] px-4 py-2.5 text-xs font-light uppercase tracking-[0.18em] text-[var(--color-noir-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {escalationState === "submitting" ? "Enviando..." : "Solicitar contacto"}
              </button>
            </form>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background px-4 py-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escriba su consulta..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Enviar mensaje"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-noir)] text-[var(--color-noir-foreground)] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 8L14 2L8 14L7 9L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Presione Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  )
}
