import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { PropertyDetail } from "@/components/catalogo/property-detail"

export default function PropertyDetailPage() {
  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      <PropertyDetail />
      <Footer />
    </main>
  )
}
