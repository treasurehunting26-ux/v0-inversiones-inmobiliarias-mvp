"use client"

import Link from "next/link"
import useSWR from "swr"
import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import { useI18n } from "@/lib/i18n/client"
import { format } from "@/lib/i18n/format"
import { localizedPath } from "@/lib/i18n/config"
import { fetcher, type PropertyListResponse } from "@/lib/properties-api"
import { submitContact } from "@/lib/contact-api"
import {
  BUDGETS,
  CHANNELS,
  GOALS,
  MARKETS,
  PHONE_DISPLAY,
  PHONE_TEL,
  TIMES,
  matchProperties,
  whatsappLink,
  type Budget,
  type Channel,
  type Goal,
  type Market,
  type Time,
} from "@/lib/enquiry"
import { useBrigitte } from "./brigitte-provider"

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/**
 * Solicitud privada: cuatro pasos de un toque (objetivo, mercado,
 * presupuesto, contacto). Al enviar, el visitante ve su selección de
 * propiedades y el equipo recibe la solicitud con el perfil completo.
 * Siempre a mano: WhatsApp y llamada directa.
 */
export function PrivateEnquiry() {
  const { locale, dict } = useI18n()
  const t = dict.enquiry
  const { close, openedFor } = useBrigitte()
  const { data } = useSWR<PropertyListResponse>("/properties", fetcher)

  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [market, setMarket] = useState<Market | null>(null)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [channel, setChannel] = useState<Channel>("whatsapp")
  const [time, setTime] = useState<Time>("any")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const summary = useMemo(() => {
    const lines = [
      goal && `${t.goalTitle} ${t.goals[goal]}`,
      market && `${t.marketTitle} ${t.markets[market]}`,
      budget && `${t.budgetTitle} ${t.budgets[budget]}`,
      openedFor && format(t.propertyNote, { title: openedFor.title }),
    ].filter(Boolean)
    return lines.join("\n")
  }, [goal, market, budget, openedFor, t])

  const whatsappText = summary ? `${t.whatsappIntro}\n\n${summary}` : t.whatsappIntro
  const selection = useMemo(
    () => (goal && market && budget && data ? matchProperties(data.properties, { goal, market, budget }) : []),
    [goal, market, budget, data],
  )

  async function submit(e: FormEvent) {
    e.preventDefault()
    const needsPhone = channel !== "email"
    if (!name.trim() || !EMAIL_RE.test(email.trim()) || (needsPhone && phone.trim().length < 6)) {
      setError(t.required)
      return
    }
    if (!consent) {
      setError(t.consentRequired)
      return
    }
    setError(null)
    setSending(true)
    try {
      await submitContact(
        {
          name: name.trim(),
          email: email.trim(),
          locale,
          source: "private_enquiry",
          investment_goal: goal ? t.goals[goal] : undefined,
          preferred_property_market: market ? t.markets[market] : undefined,
          budget_range: budget ? t.budgets[budget] : undefined,
          context: [
            summary,
            `${t.contactTitle} ${t.channels[channel]} · ${t.times[time]}`,
            phone.trim() && `${t.phone}: ${phone.trim()}`,
          ]
            .filter(Boolean)
            .join("\n")
            .slice(0, 2000),
        },
        t.error,
      )
      setDone(true)
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t.error)
    } finally {
      setSending(false)
    }
  }

  const choose = <T,>(setter: (v: T) => void, value: T) => {
    setter(value)
    setStep((s) => s + 1)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-8">
        {!done ? (
          <>
            <div className="mb-7 flex items-center justify-between text-[0.82rem] text-muted-foreground">
              <span>{format(t.step, { n: String(step) })}</span>
              {step > 1 && (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="text-copper-ink hover:underline">
                  {t.back}
                </button>
              )}
            </div>
            <div className="mb-8 h-px w-full bg-border">
              <div className="h-px bg-copper transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
            </div>

            {openedFor && step === 1 && (
              <p className="mb-6 text-sm text-muted-foreground">{format(t.propertyNote, { title: openedFor.title })}</p>
            )}

            {step === 1 && (
              <Question title={t.goalTitle}>
                {GOALS.map((g) => (
                  <Choice key={g} selected={goal === g} onClick={() => choose(setGoal, g)}>
                    {t.goals[g]}
                  </Choice>
                ))}
              </Question>
            )}
            {step === 2 && (
              <Question title={t.marketTitle}>
                {MARKETS.map((m) => (
                  <Choice key={m} selected={market === m} onClick={() => choose(setMarket, m)}>
                    {t.markets[m]}
                  </Choice>
                ))}
              </Question>
            )}
            {step === 3 && (
              <Question title={t.budgetTitle}>
                {BUDGETS.map((b) => (
                  <Choice key={b} selected={budget === b} onClick={() => choose(setBudget, b)}>
                    {t.budgets[b]}
                  </Choice>
                ))}
              </Question>
            )}
            {step === 4 && (
              <form onSubmit={submit} className="space-y-5" noValidate>
                <h3 className="font-serif text-2xl leading-snug text-foreground">{t.contactTitle}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {CHANNELS.map((c) => (
                    <Choice key={c} compact selected={channel === c} onClick={() => setChannel(c)}>
                      {t.channels[c]}
                    </Choice>
                  ))}
                </div>
                <Field label={t.name} value={name} onChange={setName} autoComplete="name" />
                <Field label={t.email} value={email} onChange={setEmail} type="email" autoComplete="email" />
                <Field
                  label={channel === "email" ? t.phoneOptional : t.phone}
                  value={phone}
                  onChange={setPhone}
                  type="tel"
                  autoComplete="tel"
                />
                <div>
                  <p className="mb-2 text-[0.82rem] text-muted-foreground">{t.timeLabel}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIMES.map((x) => (
                      <Choice key={x} compact selected={time === x} onClick={() => setTime(x)}>
                        {t.times[x]}
                      </Choice>
                    ))}
                  </div>
                </div>
                <label className="flex items-start gap-3 text-[0.82rem] leading-snug text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[var(--color-copper-ink)]"
                  />
                  {t.consent}
                </label>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-noir px-6 py-4 text-sm text-noir-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {sending ? t.sending : t.submit}
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-3xl leading-tight text-foreground">
                {format(t.doneTitle, { name: name.trim().split(" ")[0] })}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {format(t.doneBody, { channel: t.doneChannel[channel], time: t.doneTime[time] })}
              </p>
            </div>
            <div>
              <p className="mb-4 text-[0.82rem] text-copper-ink">{t.selectionTitle}</p>
              {selection.length === 0 ? (
                <p className="border-l border-copper/60 pl-4 text-sm leading-relaxed text-muted-foreground">
                  {t.selectionEmpty}
                </p>
              ) : (
                <div className="space-y-3">
                  {selection.map((p) => (
                    <Link
                      key={p.id}
                      href={localizedPath(locale, "opportunities", p.id)}
                      onClick={close}
                      className="group flex items-center gap-4 border border-border bg-card p-3 pr-4 transition-colors hover:border-copper"
                    >
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden bg-mist">
                        {p.photos?.[0] && (
                          <img src={p.photos[0]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-lg leading-snug text-foreground">{p.title}</p>
                        <p className="truncate text-[0.82rem] text-muted-foreground">{p.location}</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{p.investment_range}</p>
                      </div>
                      <span className="shrink-0 text-[0.82rem] text-copper-ink group-hover:underline">{t.view}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contacto directo, siempre visible */}
      <div className="border-t border-border bg-card px-6 py-4 sm:px-8">
        <p className="mb-3 text-[0.82rem] text-muted-foreground">{t.directTitle}</p>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={whatsappLink(whatsappText)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-border bg-background px-3 py-3 text-sm text-foreground transition-colors hover:border-copper"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-[#25D366]">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z" />
            </svg>
            {t.directWhatsapp}
          </a>
          <a
            href={`tel:${PHONE_TEL}`}
            className="flex items-center justify-center gap-2 border border-border bg-background px-3 py-3 text-sm text-foreground transition-colors hover:border-copper"
            aria-label={`${t.directCall} ${PHONE_DISPLAY}`}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 2.5h2.2l1.1 3-1.5 1a8 8 0 0 0 4.7 4.7l1-1.5 3 1.1v2.2a1 1 0 0 1-1 1A11.5 11.5 0 0 1 2 3.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            {t.directCall}
          </a>
        </div>
      </div>
    </div>
  )
}

function Question({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-6 font-serif text-2xl leading-snug text-foreground">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function Choice({
  selected,
  onClick,
  compact = false,
  children,
}: {
  selected: boolean
  onClick: () => void
  compact?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center justify-between border text-left transition-colors ${
        compact ? "justify-center px-2 py-2.5 text-center text-sm" : "px-5 py-4 text-[0.95rem]"
      } ${selected ? "border-copper bg-background text-foreground" : "border-border bg-card text-foreground hover:border-copper/70"}`}
    >
      {children}
      {!compact && (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-copper-ink">
          <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.82rem] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        maxLength={type === "email" ? 320 : 200}
        className="w-full border border-border bg-background px-4 py-3 text-[0.95rem] text-foreground focus:border-copper focus:outline-none"
      />
    </label>
  )
}
