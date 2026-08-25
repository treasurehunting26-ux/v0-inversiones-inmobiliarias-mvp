/**
 * Comprime y redimensiona una imagen en el navegador antes de subirla.
 *
 * Las fotos que salen directo de un movil moderno (12 MP o mas) suelen
 * pesar 8-20 MB, lo que supera comodamente el limite pensado para fichas
 * de propiedad. En vez de rechazar la subida, redimensionamos al lado
 * mayor indicado y recodificamos a JPEG con calidad alta: el resultado es
 * casi siempre de 1-3 MB sin perdida visible de calidad para web.
 *
 * Si el archivo ya es pequeno o no se puede procesar (formato raro,
 * navegador sin soporte canvas), se devuelve el original sin tocar.
 */
export async function compressImage(
  file: File,
  { maxDimension = 2400, quality = 0.85 }: { maxDimension?: number; quality?: number } = {},
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file
  }

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality))
    if (!blob) return file

    // Si por lo que sea el resultado comprimido saliera mas pesado que el
    // original (raro, pero puede pasar con PNGs muy simples), nos quedamos
    // con el archivo original.
    if (blob.size >= file.size) return file

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg"
    return new File([blob], newName, { type: "image/jpeg" })
  } catch {
    // Cualquier fallo en el proceso de compresion no debe bloquear la
    // subida: seguimos con el archivo tal cual lo eligio el usuario.
    return file
  }
}
