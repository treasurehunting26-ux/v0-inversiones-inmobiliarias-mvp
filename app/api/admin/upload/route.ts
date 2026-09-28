import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { type NextRequest, NextResponse } from "next/server"

// Limites pensados para fichas de propiedad: fotos ligeras, video breve
// (60-90s comprimido) para mantener el coste de almacenamiento y
// transferencia bajo control. Las fotos se comprimen en el navegador
// antes de llegar aqui (ver lib/compress-image.ts), asi que en la
// practica casi siempre pesan 1-3 MB; este limite es un colchon de
// seguridad para el caso en que la compresion no reduzca lo suficiente.
const MAX_PHOTO_BYTES = 15 * 1024 * 1024 // 15 MB
const MAX_VIDEO_BYTES = 150 * 1024 * 1024 // 150 MB
// Un dossier prediseñado (HTML con fotos incrustadas en base64) puede pesar
// varios MB por foto: se permite un limite generoso.
const MAX_DOCUMENT_BYTES = 60 * 1024 * 1024 // 60 MB

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]
const ALLOWED_DOCUMENT_TYPES = ["text/html"]

/**
 * Genera un token de subida de corta duracion para que el navegador suba
 * el archivo DIRECTAMENTE a Vercel Blob, sin pasar por esta funcion.
 *
 * Motivo: las funciones serverless de Vercel tienen un limite de ~4.5 MB
 * en el cuerpo de la peticion. Antes el archivo se enviaba completo aqui
 * (via formData) y cualquier foto o video superaba ese limite, causando
 * error 413. Con el flujo de "client upload" solo viaja por esta funcion
 * un token pequeno; el archivo va directo del navegador al almacenamiento.
 */
export async function POST(request: NextRequest) {
  const adminToken = request.headers.get("x-admin-token") || ""
  const expected = process.env.ADMIN_TOKEN || ""

  if (!expected) {
    return NextResponse.json({ error: "Admin no configurado en el servidor" }, { status: 503 })
  }
  if (adminToken !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let kind: string | null = null
        try {
          kind = clientPayload ? (JSON.parse(clientPayload).kind as string) : null
        } catch {
          kind = null
        }

        if (kind !== "photo" && kind !== "video" && kind !== "document") {
          throw new Error("Tipo de archivo no reconocido")
        }

        const allowedContentTypes =
          kind === "photo" ? ALLOWED_PHOTO_TYPES : kind === "video" ? ALLOWED_VIDEO_TYPES : ALLOWED_DOCUMENT_TYPES
        const maximumSizeInBytes =
          kind === "photo" ? MAX_PHOTO_BYTES : kind === "video" ? MAX_VIDEO_BYTES : MAX_DOCUMENT_BYTES

        return {
          allowedContentTypes,
          maximumSizeInBytes,
          addRandomSuffix: true,
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("[v0] Error generando token de subida a Blob:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo iniciar la subida" },
      { status: 400 },
    )
  }
}
