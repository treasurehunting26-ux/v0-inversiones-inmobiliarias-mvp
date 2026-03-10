import type { Metadata } from "next"
import Link from "next/link"
import { AssistantChat } from "@/components/AssistantChat"

export const metadata: Metadata = {
  title: "Asesor de Inversiones — Inversiones Inmobiliarias",
  description: "Consulte con nuestro asesor especializado en inversiones inmobiliarias para encontrar la oportunidad adecuada a su perfil.",
}

export default function AsistentePage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver
        </Link>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-semibold text-foreground">Asesor de Inversiones</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Disponible ahora
          </span>
        </div>
        <div className="w-16" aria-hidden="true" />
      </header>

      {/* Chat */}
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto flex h-full max-w-2xl flex-col">
          <AssistantChat />
        </div>
      </main>
    </div>
  )
}
