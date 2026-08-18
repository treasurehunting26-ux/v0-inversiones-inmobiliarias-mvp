const faqs = [
  {
    question: "¿Cómo seleccionáis las oportunidades?",
    answer:
      "Cada activo pasa por un análisis previo de ubicación, situación registral y potencial de revalorización. Solo publicamos los que superan ese filtro, de modo que recibas pocas opciones bien estudiadas en lugar de un catálogo extenso.",
  },
  {
    question: "¿En qué mercados trabajáis?",
    answer:
      "Europa, Latinoamérica y Dubái. En cada uno contamos con criterio local para valorar precio, demanda y marco normativo antes de presentar una operación.",
  },
  {
    question: "¿Qué rentabilidad puedo esperar?",
    answer:
      "Depende del activo, del mercado y del plazo, por lo que no ofrecemos cifras genéricas. Para cada oportunidad concreta compartimos los supuestos de cálculo y los riesgos asociados, de forma que puedas valorarlos con tu propio asesor fiscal o financiero.",
  },
  {
    question: "¿Qué importe mínimo se necesita para invertir?",
    answer:
      "Varía según la operación y la estructura de entrada. Indícanos tu horizonte y capacidad de inversión y te orientamos sobre qué encaja en tu perfil.",
  },
  {
    question: "¿Cómo empieza el proceso?",
    answer:
      "Con una primera conversación sin compromiso. A partir de tus objetivos, un asesor te acompaña en la preselección, la visita y la formalización de la compra.",
  },
]

export function Faq() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 max-w-2xl">
          <span className="text-xs font-light uppercase tracking-[0.3em] text-accent">Preguntas frecuentes</span>
          <h2 className="mt-5 font-serif text-4xl font-light leading-tight text-balance text-foreground md:text-5xl">
            Lo que suelen preguntarnos los inversores
          </h2>
        </div>

        <dl className="grid grid-cols-1 gap-x-14 gap-y-10 md:grid-cols-2">
          {faqs.map((item) => (
            <div key={item.question} className="border-t border-border pt-6">
              <dt className="font-serif text-xl font-light text-foreground md:text-2xl">{item.question}</dt>
              <dd className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
