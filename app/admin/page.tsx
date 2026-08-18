"use client"

import { useEffect, useState } from "react"
import { AdminGate } from "@/components/admin/admin-gate"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

const TOKEN_KEY = "admin_token"

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY)
    if (stored) setToken(stored)
    setHydrated(true)
  }, [])

  function handleAuthed(t: string) {
    sessionStorage.setItem(TOKEN_KEY, t)
    setToken(t)
  }

  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }

  if (!hydrated) return null

  return (
    <main className="min-h-screen bg-background">
      {token ? (
        <AdminDashboard token={token} onLogout={handleLogout} />
      ) : (
        <AdminGate onAuthed={handleAuthed} />
      )}
    </main>
  )
}
