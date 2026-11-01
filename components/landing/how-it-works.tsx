import type { Dictionary } from "@/lib/i18n"
import { Reveal } from "@/components/dossier/reveal"

/** Cómo trabajamos: tres pasos, en orden de lectura (sin numerar). */
export function HowItWorks({ t }: { t: Dictionary["howItWorks"] }) {
  return (
    <section id="como-funciona" className="bg-mist">
      <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
        <h2 className="mb-16 max-w-2xl font-serif text-4xl font-light leading-tight text-balance text-foreground md:mb-20 md:text-5xl">
          {t.title}
        </h2>

        <ol className="grid gap-12 md:grid-cols-3 md:gap-12">
          {t.steps.map((step) => (
            <li key={step.title} className="list-none">
              <Reveal className="flex flex-col gap-4">
                <h3 className="font-serif text-[1.75rem] font-light leading-snug text-foreground">{step.title}</h3>
                <p className="text-[1rem] leading-relaxed text-muted-foreground">{step.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
