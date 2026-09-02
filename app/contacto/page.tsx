import type { Metadata } from "next"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { ContactForm } from "@/components/contacto/contact-form"

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacta directamente con un asesor de inversión de B&G Consulting. Canal directo para inversores que buscan acompañamiento personalizado.",
  alternates: { canonical: "/contacto" },
}

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-background">
      <NavBar />

      {/* Cabecera noir */}
      <section className="bg-noir px-6 pb-20 pt-40 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-light uppercase tracking-[0.28em] text-gold">
            Punto de contacto humano
          </span>
          <h1 className="mt-6 font-serif text-5xl font-light leading-[1.05] text-noir-foreground md:text-6xl">
            Habla directamente con un asesor
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-noir-foreground/60">
            Si prefieres un contacto directo, déjanos tus datos y un asesor revisará tu solicitud
            personalmente. Para una orientación inmediata, nuestro asistente está siempre disponible.
          </p>
        </div>
      </section>

      {/* Formulario sobre marfil */}
      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <ContactForm />
        </div>
      </section>

      <Footer />
    </main>
  )
}
