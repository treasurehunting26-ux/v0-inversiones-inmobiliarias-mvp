import { type NextRequest, NextResponse } from "next/server"

// Referencia: FASE2_AGENTE_CAPTADOR.md
//
// Este endpoint es el punto de entrada del Cron Job de Vercel (ver
// vercel.json, ejecucion nocturna a las 03:00). Vercel adjunta
// automaticamente el header "Authorization: Bearer <CRON_SECRET>" cuando
// la variable de entorno CRON_SECRET esta configurada, lo que evita que
// cualquier visitante pueda disparar el ciclo de captacion llamando a
// esta URL directamente.
//
// Este endpoint NO decide nada por si mismo: solo reenvia la peticion al
// backend (/prospecting/run), que es quien ejecuta el ciclo real y
// aplica todas las reglas del documento (nunca contacta a nadie, nunca
// crea un Investor directamente).
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const adminToken = process.env.ADMIN_TOKEN

  if (!apiUrl || !adminToken) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 503 })
  }

  try {
    const res = await fetch(`${apiUrl}/prospecting/run`, {
      method: "POST",
      headers: { "X-Admin-Token": adminToken },
    })
    const data = await res.json()

    if (!res.ok) {
      console.error("[v0] Fallo el ciclo de captacion:", data)
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error al invocar el ciclo de captacion:", error)
    return NextResponse.json({ error: "No se pudo contactar con el backend" }, { status: 502 })
  }
}
