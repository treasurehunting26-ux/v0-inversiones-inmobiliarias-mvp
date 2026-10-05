"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useI18n } from "@/lib/i18n/client"
import { format } from "@/lib/i18n/format"
import { BrigitteError, requestHandoff, sendToBrigitte } from "@/lib/brigitte-api"
import { submitContact } from "@/lib/contact-api"
import { BrigitteWidget } from "./brigitte-widget"

export type ChatMessage = { role: "user" | "assistant"; content: string }
export type HandoffState = "idle" | "collecting" | "submitting" | "submitted"
export type PropertyRef = { id: string; title: string }

type BrigitteContextValue = {
  messages: ChatMessage[]
  typing: boolean
  handoff: HandoffState
  handoffError: string | null
  /** true si el visitante pidio una persona con el boton (el formulario se presenta con su propio texto) */
  handoffViaButton: boolean
  isOpen: boolean
  /** true en /asistente: el chat va incrustado en la pagina y se oculta el flotante */
  embedded: boolean
  open: (opts?: { property?: PropertyRef }) => void
  /** Fija la propiedad de la conversacion sin abrir el panel (ej. enlace del dossier a /asistente). */
  focus: (property: PropertyRef) => void
  close: () => void
  send: (text: string) => Promise<void>
  startHandoff: () => void
  submitHandoff: (data: { name: string; email: string; phone?: string }) => Promise<void>
  setEmbedded: (value: boolean) => void
  /** La ficha de propiedad la registra: si el visitante abre el chat ahi, Brigitte sabe de que activo habla. */
  setPageProperty: (property: PropertyRef | null) => void
}

const BrigitteContext = createContext<BrigitteContextValue | null>(null)

const STORAGE_KEY = "brigitte:v1"

type Persisted = {
  conversationId: string | null
  messages: ChatMessage[]
  handoff: HandoffState
  propertyId: string | null
  greetedProperties: string[]
}

function load(): Persisted | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Persisted) : null
  } catch {
    return null
  }
}

function save(data: Persisted) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Sin almacenamiento: la conversacion dura mientras la pagina siga abierta.
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Pausa minima antes de mostrar la respuesta, proporcional a su longitud: ritmo de conversacion real. */
function readingPause(reply: string, elapsedMs: number): number {
  const natural = Math.min(700 + reply.length * 12, 2400)
  return Math.max(0, natural - elapsedMs)
}

export function BrigitteProvider({ children }: { children: ReactNode }) {
  const { locale, dict } = useI18n()
  const t = dict.brigitte

  const greeting: ChatMessage = useMemo(() => ({ role: "assistant", content: t.greeting }), [t.greeting])

  const [messages, setMessages] = useState<ChatMessage[]>([greeting])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)
  const [handoff, setHandoff] = useState<HandoffState>("idle")
  const [handoffError, setHandoffError] = useState<string | null>(null)
  const [handoffViaButton, setHandoffViaButton] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [embedded, setEmbedded] = useState(false)
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [greetedProperties, setGreetedProperties] = useState<string[]>([])
  const pageProperty = useRef<PropertyRef | null>(null)
  const restored = useRef(false)

  // Recupera la conversacion al recargar o cambiar de pagina.
  useEffect(() => {
    const data = load()
    if (data && data.messages?.length) {
      setMessages(data.messages)
      setConversationId(data.conversationId)
      setHandoff(data.handoff === "submitting" ? "collecting" : data.handoff)
      setPropertyId(data.propertyId)
      setGreetedProperties(data.greetedProperties ?? [])
    }
    restored.current = true
  }, [])

  useEffect(() => {
    if (!restored.current) return
    save({ conversationId, messages, handoff, propertyId, greetedProperties })
  }, [conversationId, messages, handoff, propertyId, greetedProperties])

  const focusProperty = useCallback(
    (property: PropertyRef) => {
      setPropertyId(property.id)
      if (!greetedProperties.includes(property.id)) {
        setGreetedProperties((prev) => [...prev, property.id])
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: format(t.propertyGreeting, { title: property.title }) },
        ])
      }
    },
    [greetedProperties, t.propertyGreeting],
  )

  const open = useCallback(
    (opts?: { property?: PropertyRef }) => {
      const property = opts?.property ?? pageProperty.current
      if (property) focusProperty(property)
      if (!embedded) setIsOpen(true)
    },
    [embedded, focusProperty],
  )

  const close = useCallback(() => setIsOpen(false), [])

  const setPageProperty = useCallback((property: PropertyRef | null) => {
    pageProperty.current = property
  }, [])

  const send = useCallback(
    async (text: string) => {
      const message = text.trim()
      if (!message || typing) return
      setMessages((prev) => [...prev, { role: "user", content: message }])
      setTyping(true)
      const started = Date.now()

      try {
        const data = await sendToBrigitte({ message, conversationId, locale, propertyId })
        setConversationId(data.conversation_id)
        await wait(readingPause(data.response, Date.now() - started))
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
        if (data.escalate_to_human && handoff === "idle") {
          setHandoffViaButton(false)
          setHandoff("collecting")
        }
      } catch (err) {
        await wait(readingPause("", Date.now() - started))
        const visitorMessage = err instanceof BrigitteError ? err.visitorMessage : null
        setMessages((prev) => [...prev, { role: "assistant", content: visitorMessage ?? t.genericError }])
        if (!visitorMessage && handoff === "idle") {
          setHandoffViaButton(false)
          setHandoff("collecting")
        }
      } finally {
        setTyping(false)
      }
    },
    [typing, conversationId, locale, propertyId, handoff, t.genericError],
  )

  const startHandoff = useCallback(() => {
    if (handoff !== "idle") return
    setHandoffViaButton(true)
    setHandoff("collecting")
  }, [handoff])

  const submitHandoff = useCallback(
    async ({ name, email, phone }: { name: string; email: string; phone?: string }) => {
      if (!name.trim() || !email.trim()) {
        setHandoffError(t.handoffRequired)
        return
      }
      setHandoffError(null)
      setHandoff("submitting")
      try {
        if (conversationId) {
          await requestHandoff({ conversationId, name, email, phone, locale, propertyId })
        } else {
          // Pidio hablar con una persona antes de escribir nada: canal de contacto directo.
          await submitContact(
            {
              name,
              email,
              context: `Escalado desde el asistente (Brigitte): pidió hablar con una persona antes de iniciar la conversación.${phone ? ` Teléfono / WhatsApp: ${phone}` : ""}`,
              locale,
            },
            t.handoffError,
          )
        }
        setHandoff("submitted")
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: format(t.handoffThanks, { name: name.trim().split(" ")[0], email }) },
        ])
      } catch {
        setHandoff("collecting")
        setHandoffError(t.handoffError)
      }
    },
    [conversationId, locale, propertyId, t.handoffRequired, t.handoffError, t.handoffThanks],
  )

  const value: BrigitteContextValue = {
    messages,
    typing,
    handoff,
    handoffError,
    handoffViaButton,
    isOpen,
    embedded,
    open,
    focus: focusProperty,
    close,
    send,
    startHandoff,
    submitHandoff,
    setEmbedded,
    setPageProperty,
  }

  return (
    <BrigitteContext.Provider value={value}>
      {children}
      {!embedded && <BrigitteWidget />}
    </BrigitteContext.Provider>
  )
}

export function useBrigitte(): BrigitteContextValue {
  const value = useContext(BrigitteContext)
  if (!value) throw new Error("useBrigitte debe usarse dentro de <BrigitteProvider>")
  return value
}
