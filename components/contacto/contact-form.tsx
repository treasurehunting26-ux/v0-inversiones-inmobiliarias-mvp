"use client"

import { useState } from "react"
import Link from "next/link"
import { submitContact } from "@/lib/contact-api"
import { useI18n } from "@/lib/i18n/client"
import { localizedPath } from "@/lib/i18n/config"

type Status = "idle" | "submitting" | "success" | "error"

export function ContactForm() {
  const { locale, dict } = useI18n()
  const t = dict.contact.form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [context, setContext] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const isValid = name.trim() && email.trim() && context.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || status === "submitting") return

    setStatus("submitting")
    setErrorMsg("")
    try {
      await submitContact(
        { name: name.trim(), email: email.trim(), context: context.trim(), locale },
        t.genericError,
      )
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : t.genericError)
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-border bg-card p-10 text-center">
        <p className="font-serif text-3xl text-foreground">{t.successTitle}</p>
        <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground">
          {t.successBody}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={localizedPath(locale, "opportunities")}
            className="border border-foreground px-7 py-3 text-sm font-light tracking-[0.01em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            {t.viewOpportunities}
          </Link>
          <Link
            href={localizedPath(locale, "assistant")}
            className="text-sm font-light tracking-[0.01em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {t.talkToAdvisor}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-light tracking-[0.01em] text-muted-foreground">
          {t.name}
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-b border-border bg-transparent py-3 text-foreground outline-none transition-colors focus:border-gold"
          placeholder={t.namePlaceholder}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-light tracking-[0.01em] text-muted-foreground">
          {t.email}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-b border-border bg-transparent py-3 text-foreground outline-none transition-colors focus:border-gold"
          placeholder={t.emailPlaceholder}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="context" className="text-sm font-light tracking-[0.01em] text-muted-foreground">
          {t.context}
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          required
          rows={5}
          className="resize-none border-b border-border bg-transparent py-3 text-foreground outline-none transition-colors focus:border-gold"
          placeholder={t.contextPlaceholder}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || status === "submitting"}
        className="mt-2 self-start bg-[var(--color-noir)] px-9 py-4 text-sm font-light tracking-[0.01em] text-[var(--color-noir-foreground)] transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {status === "submitting" ? t.submitting : t.submit}
      </button>

      <p className="text-xs font-light leading-relaxed text-muted-foreground/70">
        {t.consent}
      </p>
    </form>
  )
}
