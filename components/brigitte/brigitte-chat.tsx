"use client"

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { useI18n } from "@/lib/i18n/client"
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
      className="flex shrink-0 items-center justify-center rounded-full border border-gold/60 bg-noir font-serif text-gold"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
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
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5" aria-live="polite">
        {messages.map((msg, i) =>
          msg.role === "assistant" ? (
            <div key={i} className="flex items-end gap-2.5">
              <BrigitteAvatar size={26} />
              <p className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground">
                {msg.content}
              </p>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <p className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-noir px-4 py-3 text-sm leading-relaxed text-noir-foreground">
                {msg.content}
              </p>
            </div>
          ),
        )}

        {typing && (
          <div className="flex items-end gap-2.5" role="status" aria-label={t.typing}>
            <BrigitteAvatar size={26} />
            <span className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
            </span>
          </div>
        )}

        {showForm && (
          <div className="flex items-end gap-2.5">
            <BrigitteAvatar size={26} />
            <form
              onSubmit={handleHandoff}
              className="w-full max-w-[82%] space-y-2.5 rounded-2xl rounded-bl-sm border border-gold/40 bg-card px-4 py-4"
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
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none disabled:opacity-50"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                autoComplete="email"
                maxLength={320}
                disabled={handoff === "submitting"}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none disabled:opacity-50"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                autoComplete="tel"
                maxLength={40}
                disabled={handoff === "submitting"}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none disabled:opacity-50"
              />
              {handoffError && <p className="text-xs text-destructive">{handoffError}</p>}
              <button
                type="submit"
                disabled={handoff === "submitting"}
                className="w-full rounded-lg bg-noir px-4 py-2.5 text-xs font-light uppercase tracking-[0.18em] text-noir-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {handoff === "submitting" ? t.handoffSending : t.handoffSubmit}
              </button>
            </form>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border bg-background px-3 pb-3 pt-2.5">
        {handoff === "idle" && (
          <button
            type="button"
            onClick={startHandoff}
            className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-gold/50 px-3 py-1 text-xs font-light text-foreground transition-colors hover:border-gold hover:bg-gold/10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
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
            className="max-h-32 flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={typing || !input.trim()}
            aria-label={t.send}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-noir text-gold transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8L14 2L8 14L7 9L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground">{t.disclaimer}</p>
      </div>
    </div>
  )
}
