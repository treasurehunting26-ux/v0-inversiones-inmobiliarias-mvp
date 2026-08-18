"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import { listProperties } from "@/lib/admin-api"

interface AdminGateProps {
  onAuthed: (token: string) => void
}

export function AdminGate({ onAuthed }: AdminGateProps) {
  const [token, setToken] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // Validamos el token contra el backend con una llamada real
      await listProperties(token)
      onAuthed(token)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error"
      if (msg === "UNAUTHORIZED") {
        setError("Contrasena incorrecta")
      } else {
        setError("No se pudo conectar con el servidor")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Panel de administracion
          </h1>
          <p className="text-sm text-muted-foreground text-center text-pretty">
            Acceso restringido. Introduce la contrasena para gestionar propiedades.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Contrasena"
            autoFocus
            required
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
          />

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Comprobando..." : "Acceder"}
          </button>
        </form>
      </div>
    </div>
  )
}
