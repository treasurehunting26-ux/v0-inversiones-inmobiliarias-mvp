import type { Metadata } from "next"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { ContactForm } from "@/components/contacto/contact-form"
import { getDictionary, pageMetadata, type Locale } from "@/lib/i18n"

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale
  const t = getDictionary(locale).contact
  return pageMetadata({ locale, route: "contact", title: t.metaTitle, description: t.metaDescription })
}

export default async function ContactPage({ params }: Props) {
  const locale = (await params).lang as Locale
  const t = getDictionary(locale).contact

  return (
    <main className="min-h-screen bg-background">
      <NavBar />

      {/* Cabecera noir */}
      <section className="bg-noir px-6 pb-20 pt-40 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-light uppercase tracking-[0.28em] text-gold">{t.eyebrow}</span>
          <h1 className="mt-6 font-serif text-5xl font-light leading-[1.05] text-noir-foreground md:text-6xl">
            {t.title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-noir-foreground/60">
            {t.intro}
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
