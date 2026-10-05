import type { Metadata } from "next"
import { BrigittePage } from "@/components/brigitte/brigitte-page"
import { getDictionary, pageMetadata, type Locale } from "@/lib/i18n"

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale
  const t = getDictionary(locale).assistantPage
  return pageMetadata({ locale, route: "assistant", title: t.metaTitle, description: t.metaDescription })
}

export default function AssistantPage() {
  return <BrigittePage />
}
