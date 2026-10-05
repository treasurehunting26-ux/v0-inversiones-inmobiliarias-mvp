import type { Metadata } from "next"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { PropertyDetail } from "@/components/catalogo/property-detail"
import { languageAlternates, type Locale } from "@/lib/i18n"

type Props = { params: Promise<{ lang: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params
  const { alternates } = languageAlternates(lang as Locale, "opportunities", [id])
  return { alternates }
}

export default function PropertyDetailPage() {
  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      <PropertyDetail />
      <Footer />
    </main>
  )
}
