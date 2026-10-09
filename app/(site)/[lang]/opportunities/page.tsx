import type { Metadata } from "next"
import { OpportunitiesView } from "@/components/catalogo/opportunities-view"
import { getDictionary, pageMetadata, type Locale } from "@/lib/i18n"

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale
  const t = getDictionary(locale).opportunities
  return pageMetadata({ locale, route: "opportunities", title: t.metaTitle, description: t.metaDescription })
}

export default async function OpportunitiesPage({ params }: Props) {
  const locale = (await params).lang as Locale
  return <OpportunitiesView locale={locale} active={null} />
}
