import type { Metadata } from "next"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { pageMetadata, type Locale } from "@/lib/i18n"
import { LEGAL_ENTITY, LEGAL_ENTITY_COMPLETE, privacyPolicy } from "@/lib/legal/privacy"

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale
  const p = privacyPolicy(locale)
  const metadata = pageMetadata({ locale, route: "privacy", title: `${p.title} | B&G Consulting`, description: p.intro })
  // Mientras falten los datos de la empresa, la página no se indexa
  if (!LEGAL_ENTITY_COMPLETE) metadata.robots = { index: false, follow: true }
  return metadata
}

export default async function PrivacyPage({ params }: Props) {
  const locale = (await params).lang as Locale
  const p = privacyPolicy(locale)
  const updated = new Date(`${LEGAL_ENTITY.updated}T12:00:00Z`).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      <section className="bg-noir px-6 pb-16 pt-40">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-5xl font-normal leading-tight text-noir-foreground">{p.title}</h1>
          <p className="mt-4 text-sm text-noir-foreground/60">
            {p.updatedLabel}: {updated}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-16">
        {!LEGAL_ENTITY_COMPLETE && (
          <p className="mb-10 border border-copper/50 bg-card px-5 py-4 text-sm text-copper-ink">{p.draftNotice}</p>
        )}
        <p className="text-lg leading-relaxed text-foreground">{p.intro}</p>
        <div className="mt-12 space-y-12">
          {p.sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-serif text-2xl font-normal text-foreground">{s.title}</h2>
              {s.paragraphs?.map((para) => (
                <p key={para.slice(0, 32)} className="mt-4 leading-relaxed text-muted-foreground">
                  {para}
                </p>
              ))}
              {s.items && (
                <ul className="mt-4 space-y-2.5">
                  {s.items.map((item) => (
                    <li key={item.slice(0, 32)} className="flex gap-3 leading-relaxed text-muted-foreground">
                      <span className="mt-2.5 h-px w-3 shrink-0 bg-copper" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
      <Footer />
    </main>
  )
}
