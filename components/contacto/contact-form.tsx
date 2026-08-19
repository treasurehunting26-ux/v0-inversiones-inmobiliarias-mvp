"use client"

import { useState } from "react"
import Link from "next/link"
import { submitContact } from "@/lib/contact-api"

type Status = "idle" | "submitting" | "success" | "error"

export function ContactForm() {
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
      await submitContact({ name: name.trim(), email: email.trim(), context: context.trim() })
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado.")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-border bg-card p-10 text-center">
        <p className="font-serif text-3xl text-foreground">Gracias por tu interés</p>
        <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground">
          Hemos recibido tu solicitud. Un asesor revisará tu mensaje y se pondrá en contacto contigo
          personalmente. Mientras tanto, puedes explorar nuestras oportunidades.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/oportunidades"
            className="border border-foreground px-7 py-3 text-xs font-light uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Ver oportunidades
          </Link>
          <Link
            href="/asistente"
            className="text-xs font-light uppercase tracking-[0.18em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Hablar con un asesor
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-xs font-light uppercase tracking-[0.18em] text-muted-foreground">
          Nombre
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-b border-border bg-transparent py-3 text-foreground outline-none transition-colors focus:border-gold"
          placeholder="Tu nombre completo"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-xs font-light uppercase tracking-[0.18em] text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-b border-border bg-transparent py-3 text-foreground outline-none transition-colors focus:border-gold"
          placeholder="tu@email.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="context" className="text-xs font-light uppercase tracking-[0.18em] text-muted-foreground">
          Contexto
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          required
          rows={5}
          className="resize-none border-b border-border bg-transparent py-3 text-foreground outline-none transition-colors focus:border-gold"
          placeholder="Cuéntanos brevemente qué tipo de inversión te interesa y tu horizonte."
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
        className="mt-2 self-start bg-[var(--color-noir)] px-9 py-4 text-xs font-light uppercase tracking-[0.2em] text-[var(--color-noir-foreground)] transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {status === "submitting" ? "Enviando…" : "Solicitar contacto"}
      </button>

      <p className="text-xs font-light leading-relaxed text-muted-foreground/70">
        Al enviar este formulario aceptas que un asesor se ponga en contacto contigo. No compartimos tus
        datos con terceros.
      </p>
    </form>
  )
}
