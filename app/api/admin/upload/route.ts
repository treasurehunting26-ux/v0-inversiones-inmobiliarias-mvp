import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

// Limites pensados para fichas de propiedad: fotos ligeras, video breve
// (60-90s comprimido) para mantener el coste de almacenamiento y
// transferencia bajo control.
const MAX_PHOTO_BYTES = 8 * 1024 * 1024 // 8 MB
const MAX_VIDEO_BYTES = 150 * 1024 * 1024 // 150 MB

const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"])
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"])

export async function POST(request: NextRequest) {
  const adminToken = request.headers.get("x-admin-token") || ""
  const expected = process.env.ADMIN_TOKEN || ""

  if (!expected) {
    return NextResponse.json({ error: "Admin no configurado en el servidor" }, { status: 503 })
  }
  if (adminToken !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const kind = formData.get("kind") as string | null

    if (!file) {
      return NextResponse.json({ error: "No se recibio ningun archivo" }, { status: 400 })
    }
    if (kind !== "photo" && kind !== "video") {
      return NextResponse.json({ error: "Tipo de archivo no reconocido" }, { status: 400 })
    }

    const allowedTypes = kind === "photo" ? ALLOWED_PHOTO_TYPES : ALLOWED_VIDEO_TYPES
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        { error: kind === "photo" ? "Formato de foto no permitido (usa JPG, PNG o WEBP)" : "Formato de video no permitido (usa MP4, WEBM o MOV)" },
        { status: 400 },
      )
    }

    const maxBytes = kind === "photo" ? MAX_PHOTO_BYTES : MAX_VIDEO_BYTES
    if (file.size > maxBytes) {
      const maxMb = Math.round(maxBytes / (1024 * 1024))
      return NextResponse.json({ error: `El archivo supera el limite de ${maxMb} MB` }, { status: 400 })
    }

    const folder = kind === "photo" ? "propiedades/fotos" : "propiedades/videos"
    const blob = await put(`${folder}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Error subiendo archivo a Blob:", error)
    return NextResponse.json({ error: "No se pudo subir el archivo" }, { status: 500 })
  }
}
