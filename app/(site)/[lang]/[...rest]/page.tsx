import { notFound } from "next/navigation"

/** Cualquier ruta que no exista en el idioma -> 404 dentro del layout del sitio. */
export default function CatchAll() {
  notFound()
}
