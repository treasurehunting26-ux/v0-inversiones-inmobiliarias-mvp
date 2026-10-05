import { NextResponse, type NextRequest } from "next/server"
import { defaultLocale, parsePublicPath } from "@/lib/i18n/config"

/**
 * Enrutado por idioma de la web publica (Next 16: "proxy", antes "middleware").
 *
 * URL publica (lo que ve el visitante)  ->  ruta interna (carpeta en app/(site)/[lang])
 *   /                       -> /es
 *   /oportunidades/123      -> /es/opportunities/123
 *   /en                     -> /en
 *   /en/opportunities/123   -> /en/opportunities/123
 *
 * - /es/... redirige a la URL sin prefijo (el espanol no lleva prefijo).
 * - Un segmento que no corresponde al idioma (ej. /opportunities sin /en)
 *   devuelve 404, para no duplicar contenido en dos URLs.
 * - /admin, /dossier, /api y los archivos estaticos no pasan por aqui.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /es o /es/... -> sin prefijo
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/"
    return NextResponse.redirect(url, 308)
  }

  const { locale, route, rest } = parsePublicPath(pathname)
  const url = request.nextUrl.clone()

  if (route === null) {
    // Ruta inexistente en este idioma: la sirve el catch-all, que responde 404.
    url.pathname = `/${locale}/__not-found`
  } else {
    const internal = route === "home" ? [] : [route]
    url.pathname = "/" + [locale, ...internal, ...rest.map(encodeURIComponent)].join("/")
  }

  return NextResponse.rewrite(url)
}

export const config = {
  // Todo excepto: api, admin, dossier, internos de Next y archivos con extension.
  matcher: ["/((?!api|admin|dossier|_next|.*\\..*).*)"],
}
