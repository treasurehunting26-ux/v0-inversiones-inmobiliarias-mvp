"use client"

import Link from "next/link"
import useSWR from "swr"
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { useI18n } from "@/lib/i18n/client"
import { localizedPath } from "@/lib/i18n/config"
import { fetcher, type Property, type PropertyListResponse } from "@/lib/properties-api"
import { useBrigitte } from "./brigitte-provider"

/**
 * Avatar de Brigitte. Mientras no haya imagen definitiva se muestra un
 * monograma de marca. Para usar una ilustracion o imagen propia, sube el
 * archivo (ej. /public/brand/brigitte-avatar.png) y pon su ruta aqui.
 */
const BRIGITTE_AVATAR_SRC: string | null = null

export function BrigitteAvatar({ size = 36 }: { size?: number }) {
  if (BRIGITTE_AVATAR_SRC) {
    return (
      <img
        src={BRIGITTE_AVATAR_SRC}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full border border-gold/60 bg-noir font-serif text-gold-soft"
      style={{ width: size, height: size, fontSize: size * 0.46 }}
    >
      B
    </span>
  )
}

export function BrigitteChat({ autoFocus = false }: { autoFocus?: boolean }) {
  const { dict } = useI18n()
  const t = dict.brigitte
  const { messages, typing, handoff, handoffError, handoffViaButton, send, submitHandoff, startHandoff } =
    useBrigitte()
  const [input, setInput] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, typing, handoff])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  function handleSend() {
    const text = input.trim()
    if (!text || typing) return
    setInput("")
    void send(text)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // No enviar mientras un IME (chino/japones/coreano) confirma composicion.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleHandoff(e: FormEvent) {
    e.preventDefault()
    void submitHandoff({ name: name.trim(), email: email.trim(), phone: phone.trim() })
  }

  const showForm = handoff === "collecting" || handoff === "submitting"

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-7" aria-live="polite">
        {messages.map((msg, i) =>
          msg.role === "assistant" ? (
            <div key={i} className="space-y-3">
              <p className="whitespace-pre-wrap border-l border-copper/60 pl-4 text-[0.95rem] leading-relaxed text-foreground">
                {msg.content}
              </p>
              {msg.properties && msg.properties.length > 0 && <PropertySuggestions ids={msg.properties} />}
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] whitespace-pre-wrap bg-mist px-4 py-3 text-[0.95rem] leading-relaxed text-foreground">
                {msg.content}
              </p>
            </div>
          ),
        )}

        {/* Primeros pasos: solo antes de que el visitante escriba */}
        {messages.every((m) => m.role === "assistant") && !typing && handoff === "idle" && (
          <div className="space-y-2.5 pl-4">
            <p className="text-[0.82rem] text-muted-foreground">{t.startersLabel}</p>
            {t.starters.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => void send(starter)}
                className="block w-full border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-copper hover:bg-background"
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        {typing && (
          <div className="flex items-center gap-1.5 border-l border-copper/60 py-2 pl-4" role="status" aria-label={t.typing}>
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-copper/70 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-copper/70 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-copper/70 [animation-delay:300ms]" />
          </div>
        )}

        {showForm && (
          <div>
            <form
              onSubmit={handleHandoff}
              className="w-full space-y-3 border border-copper/40 bg-card px-5 py-5"
            >
              {handoffViaButton && <p className="text-sm leading-relaxed text-foreground">{t.handoffIntro}</p>}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                autoComplete="name"
                maxLength={200}
                disabled={handoff === "submitting"}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-copper focus:outline-none disabled:opacity-50"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                autoComplete="email"
                maxLength={320}
                disabled={handoff === "submitting"}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-copper focus:outline-none disabled:opacity-50"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                autoComplete="tel"
                maxLength={40}
                disabled={handoff === "submitting"}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-copper focus:outline-none disabled:opacity-50"
              />
              {handoffError && <p className="text-xs text-destructive">{handoffError}</p>}
              <button
                type="submit"
                disabled={handoff === "submitting"}
                className="w-full bg-noir px-4 py-3 text-sm text-noir-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {handoff === "submitting" ? t.handoffSending : t.handoffSubmit}
              </button>
            </form>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border bg-background px-5 pb-4 pt-3">
        {handoff === "idle" && (
          <button
            type="button"
            onClick={startHandoff}
            className="mb-3 inline-flex items-center gap-2 text-sm text-copper-ink underline-offset-4 transition-colors hover:underline"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 2.5h2.2l1.1 3-1.5 1a8 8 0 0 0 4.7 4.7l1-1.5 3 1.1v2.2a1 1 0 0 1-1 1A11.5 11.5 0 0 1 2 3.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            {t.talkToPerson}
          </button>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            rows={1}
            maxLength={2000}
            aria-label={t.placeholder}
            className="max-h-32 flex-1 resize-none border border-border bg-card px-4 py-3 text-[0.95rem] text-foreground placeholder:text-muted-foreground focus:border-copper focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={typing || !input.trim()}
            aria-label={t.send}
            className="flex h-12 w-12 shrink-0 items-center justify-center bg-noir text-gold-soft transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8L14 2L8 14L7 9L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="mt-2.5 text-center text-[0.75rem] leading-snug text-muted-foreground">{t.disclaimer}</p>
      </div>
    </div>
  )
}

/** Fichas de las propiedades que Brigitte recomienda (solo publicadas). */
function PropertySuggestions({ ids }: { ids: string[] }) {
  const { locale, dict } = useI18n()
  const { close, embedded } = useBrigitte()
  const { data } = useSWR<PropertyListResponse>("/properties", fetcher)
  const items = ids
    .map((id) => data?.properties.find((p) => p.id === id))
    .filter((p): p is Property => Boolean(p))
  if (items.length === 0) return null

  return (
    <div className="space-y-2 pl-4">
      {items.map((p) => (
        <Link
          key={p.id}
          href={localizedPath(locale, "opportunities", p.id)}
          onClick={() => {
            if (!embedded) close()
          }}
          className="group flex items-center gap-4 border border-border bg-card p-2.5 pr-4 transition-colors hover:border-copper"
        >
          <div className="relative h-16 w-20 shrink-0 overflow-hidden bg-mist">
            {p.photos?.[0] && <img src={p.photos[0]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-base leading-snug text-foreground">{p.title}</p>
            <p className="truncate text-[0.82rem] text-muted-foreground">{p.location}</p>
            <p className="mt-0.5 text-[0.82rem] font-medium text-foreground">{p.investment_range}</p>
          </div>
          <span className="shrink-0 text-[0.82rem] text-copper-ink group-hover:underline">{dict.brigitte.viewProperty}</span>
        </Link>
      ))}
    </div>
  )
}
