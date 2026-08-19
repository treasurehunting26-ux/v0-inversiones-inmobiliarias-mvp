import { NavBar } from "@/components/landing/nav-bar"
import { Hero } from "@/components/landing/hero"
import { Credibility } from "@/components/landing/credibility"
import { Markets } from "@/components/landing/markets"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Showcase } from "@/components/landing/showcase"
import { Features } from "@/components/landing/features"
import { Faq } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      <Hero />
      <Credibility />
      <Markets />
      <HowItWorks />
      <Showcase />
      <Features />
      <Faq />
      <CTA />
      <Footer />
    </main>
  )
}
