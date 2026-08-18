import type { Metadata } from "next"
import Link from "next/link"
import { AssistantChat } from "@/components/AssistantChat"

export const metadata: Metadata = {
  title: "Asesor de Inversiones — Inversiones Inmobiliarias",
  description:
    "Consulte con nuestro asesor especializado en inversiones inmobiliarias para encontrar la oportunidad adecuada a su perfil.",
}

export default function AsistentePage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header de marca noir */}
      <header className="flex items-center justify-between border-b border-[var(--ivory)]/10 bg-[var(--noir)] px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[var(--ivory)]/60 transition-colors hover:text-[var(--gold)]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Volver
        </Link>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-serif text-lg font-light tracking-[0.2em] text-[var(--ivory)]">ATERRA</span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--ivory)]/50">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            Asesor disponible
          </span>
        </div>
        <div className="w-16" aria-hidden="true" />
      </header>

      {/* Chat */}
      <main className="flex-1 overflow-hidden bg-background">
        <div className="mx-auto flex h-full max-w-2xl flex-col">
          <AssistantChat />
        </div>
      </main>
    </div>
  )
}
