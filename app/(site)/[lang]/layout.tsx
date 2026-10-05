import type { Metadata } from "next"
import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { jost, cormorant } from "@/lib/fonts"
import { getDictionary, isLocale, languageAlternates, locales, SITE_URL } from "@/lib/i18n"
import { I18nProvider } from "@/lib/i18n/client"
import { BrigitteProvider } from "@/components/brigitte/brigitte-provider"
import "../../globals.css"

type Props = { children: ReactNode; params: Promise<{ lang: string }> }

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

// Solo existen los idiomas configurados: /fr (aun no creado) da 404.
export const dynamicParams = false

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const t = getDictionary(lang)
  const { alternates, openGraph } = languageAlternates(lang, "home")

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: "%s — B&G Consulting" },
    applicationName: "B&G Consulting",
    description: t.meta.description,
    keywords: t.meta.keywords,
    alternates,
    openGraph: {
      type: "website",
      siteName: "B&G Consulting",
      url: alternates?.canonical as string,
      title: t.meta.title,
      description: t.meta.ogDescription,
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.ogDescription,
    },
  }
}

export default async function SiteRootLayout({ children, params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const dict = getDictionary(lang)

  return (
    <html lang={lang} className="bg-background">
      <body className={`${jost.variable} ${cormorant.variable} font-sans antialiased`}>
        <I18nProvider locale={lang} dict={dict}>
          <BrigitteProvider>{children}</BrigitteProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
