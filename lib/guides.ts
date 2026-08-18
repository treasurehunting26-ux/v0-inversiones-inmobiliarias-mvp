export type GuideSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export type GuideFAQ = {
  question: string
  answer: string
}

export type Guide = {
  slug: string
  category: "Guía de zona" | "Comparativa de mercado" | "Análisis" | "Preguntas frecuentes"
  region: "Europa" | "Latinoamérica" | "Dubái" | "Internacional"
  title: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  excerpt: string
  readingTime: string
  updated: string
  sections: GuideSection[]
  faqs: GuideFAQ[]
}

export const guides: Guide[] = [
  {
    slug: "invertir-inmuebles-marbella-costa-del-sol",
    category: "Guía de zona",
    region: "Europa",
    title: "Cómo invertir en inmuebles en Marbella y la Costa del Sol",
    metaTitle: "Invertir en inmuebles en Marbella: guía para inversores 2026",
    metaDescription:
      "Guía práctica para invertir en propiedades en Marbella y la Costa del Sol: tipos de activo, factores de demanda, marco fiscal y consideraciones clave para inversores internacionales.",
    keywords: [
      "invertir en marbella",
      "inversión inmobiliaria costa del sol",
      "comprar propiedad marbella",
      "real estate marbella",
      "propiedades de lujo españa",
    ],
    excerpt:
      "Qué considerar antes de invertir en la Costa del Sol: demanda internacional, tipos de activo, estacionalidad y marco fiscal para no residentes.",
    readingTime: "8 min",
    updated: "Enero 2026",
    sections: [
      {
        heading: "Por qué la Costa del Sol atrae capital internacional",
        paragraphs: [
          "La Costa del Sol, y Marbella en particular, se ha consolidado como uno de los mercados inmobiliarios premium más estables del sur de Europa. Su atractivo combina clima, conectividad internacional a través del aeropuerto de Málaga, infraestructura consolidada y una comunidad internacional asentada desde hace décadas.",
          "Para el inversor, esto se traduce en una demanda diversificada por nacionalidad y por motivo de compra: segunda residencia, reubicación, alquiler vacacional y diversificación patrimonial. Esa diversidad reduce la dependencia de un único segmento de comprador.",
        ],
      },
      {
        heading: "Tipos de activo más habituales",
        paragraphs: [
          "No todos los activos cumplen el mismo papel en una cartera. Conviene diferenciar el objetivo de cada inversión antes de comprar.",
        ],
        bullets: [
          "Villas independientes: mayor ticket de entrada y mantenimiento, orientadas a revalorización y uso propio.",
          "Apartamentos en complejos con servicios: más líquidos y con demanda de alquiler más estable.",
          "Obra nueva sobre plano: permite entrar a precio anticipado, con un horizonte temporal más largo y riesgo de ejecución.",
          "Activos para reposicionamiento: propiedades a reformar con potencial de revalorización tras mejora.",
        ],
      },
      {
        heading: "Marco fiscal para no residentes",
        paragraphs: [
          "La inversión de no residentes en España conlleva obligaciones fiscales específicas que conviene conocer antes de cerrar una operación. Entre ellas, el Impuesto de Transmisiones Patrimoniales o el IVA en obra nueva, el impuesto sobre la renta de no residentes y, en su caso, el impuesto sobre el patrimonio.",
          "La estructura de compra (a nombre personal o a través de sociedad) tiene implicaciones fiscales y sucesorias relevantes. Es una decisión que debe tomarse con asesoramiento profesional individualizado, ya que depende de la residencia fiscal del inversor y de sus objetivos.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Necesito ser residente en España para invertir en Marbella?",
        answer:
          "No. Los no residentes pueden adquirir inmuebles en España. Sí es necesario obtener un NIE (Número de Identificación de Extranjero) y cumplir con las obligaciones fiscales asociadas a la propiedad.",
      },
      {
        question: "¿Qué costes adicionales tiene la compra más allá del precio?",
        answer:
          "De forma orientativa, los costes de transacción (impuestos, notaría, registro y honorarios) suelen situarse en un rango porcentual sobre el precio. La cifra exacta depende del tipo de activo y de si es obra nueva o segunda transmisión, por lo que debe calcularse caso a caso.",
      },
    ],
  },
  {
    slug: "invertir-inmuebles-dubai-guia-inversor",
    category: "Guía de zona",
    region: "Dubái",
    title: "Invertir en inmuebles en Dubái: guía para inversores internacionales",
    metaTitle: "Invertir en inmuebles en Dubái: guía 2026 para inversores",
    metaDescription:
      "Claves para invertir en el mercado inmobiliario de Dubái: zonas freehold, marco regulatorio, fiscalidad y factores de demanda para inversores internacionales.",
    keywords: [
      "invertir en dubai",
      "inversión inmobiliaria dubai",
      "comprar propiedad dubai",
      "dubai real estate",
      "propiedades freehold dubai",
    ],
    excerpt:
      "Zonas freehold, papel del RERA, fiscalidad y factores de demanda en uno de los mercados inmobiliarios más dinámicos del mundo.",
    readingTime: "7 min",
    updated: "Enero 2026",
    sections: [
      {
        heading: "El concepto de propiedad freehold",
        paragraphs: [
          "Dubái permite a los extranjeros adquirir propiedad en plena propiedad (freehold) dentro de zonas designadas. Esto fue un cambio estructural que abrió el mercado al capital internacional y explica buena parte del desarrollo de las últimas dos décadas.",
          "Para el inversor, es fundamental verificar que el activo se encuentra en una zona freehold antes de avanzar, ya que fuera de ellas el régimen de propiedad puede ser distinto (leasehold o uso).",
        ],
      },
      {
        heading: "Marco regulatorio: RERA y DLD",
        paragraphs: [
          "El mercado está regulado por el Dubai Land Department (DLD) y su agencia reguladora RERA. Existen mecanismos como las cuentas de garantía (escrow) para proyectos sobre plano, diseñados para proteger al comprador.",
          "Conocer estos mecanismos es parte de la diligencia debida. La existencia de regulación no elimina el riesgo, pero ofrece un marco verificable de protección al inversor.",
        ],
      },
      {
        heading: "Fiscalidad y consideraciones de divisa",
        paragraphs: [
          "Dubái es conocido por un marco fiscal favorable para la propiedad inmobiliaria, aunque existen tasas de transacción asociadas al registro. El inversor debe considerar también el efecto de la divisa, ya que el dírham está vinculado al dólar estadounidense.",
          "La fiscalidad final depende siempre de la residencia fiscal del inversor en su país de origen. Es imprescindible asesoramiento individualizado.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Pueden los extranjeros comprar propiedad en Dubái?",
        answer:
          "Sí, dentro de las zonas designadas como freehold los extranjeros pueden adquirir propiedad en plena propiedad. Es clave confirmar la naturaleza freehold del activo antes de comprar.",
      },
      {
        question: "¿Qué es una cuenta escrow en proyectos sobre plano?",
        answer:
          "Es una cuenta regulada donde se depositan los pagos del comprador y desde la que el promotor solo puede disponer según el avance de obra. Es un mecanismo de protección supervisado por el regulador.",
      },
    ],
  },
  {
    slug: "comparativa-mercados-europa-latam-dubai",
    category: "Comparativa de mercado",
    region: "Internacional",
    title: "Europa, Latinoamérica y Dubái: cómo comparar mercados inmobiliarios",
    metaTitle: "Comparativa de mercados inmobiliarios: Europa, LatAm y Dubái",
    metaDescription:
      "Marco para comparar mercados inmobiliarios internacionales: liquidez, marco legal, divisa, fiscalidad y perfil de demanda. Cómo evaluar cada mercado antes de invertir.",
    keywords: [
      "comparativa mercados inmobiliarios",
      "invertir internacional inmuebles",
      "diversificación inmobiliaria",
      "mercados real estate internacional",
    ],
    excerpt:
      "Un marco de criterios objetivos —liquidez, marco legal, divisa y demanda— para comparar mercados antes de comprometer capital.",
    readingTime: "9 min",
    updated: "Enero 2026",
    sections: [
      {
        heading: "No existe un mercado mejor, sino uno adecuado a cada objetivo",
        paragraphs: [
          "Comparar mercados inmobiliarios no consiste en buscar el de mayor rentabilidad teórica, sino el que mejor encaja con el objetivo del inversor: preservación de capital, generación de renta, revalorización o diversificación geográfica.",
          "Cada mercado tiene un perfil de riesgo y unas características estructurales distintas. La comparación útil se hace sobre criterios homogéneos, no sobre titulares.",
        ],
      },
      {
        heading: "Criterios objetivos de comparación",
        paragraphs: ["Estos son los ejes que permiten una comparación rigurosa entre jurisdicciones:"],
        bullets: [
          "Liquidez: facilidad y plazo medio para vender el activo.",
          "Marco legal: seguridad jurídica de la propiedad y protección al comprador extranjero.",
          "Divisa: exposición al tipo de cambio frente a la moneda del inversor.",
          "Fiscalidad: impuestos de transacción, tenencia y transmisión.",
          "Perfil de demanda: diversidad de compradores y dependencia de un único segmento.",
        ],
      },
      {
        heading: "Diversificación geográfica como estrategia",
        paragraphs: [
          "Distribuir capital entre mercados con ciclos económicos y monedas distintas puede reducir la exposición a un único factor de riesgo. No es una garantía de mejores resultados, sino una forma de gestionar la concentración.",
          "La diversificación añade complejidad operativa y fiscal, por lo que tiene sentido cuando el volumen de inversión la justifica.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Es mejor concentrar la inversión en un solo mercado o diversificar?",
        answer:
          "Depende del volumen, los objetivos y la tolerancia al riesgo del inversor. La concentración simplifica la gestión; la diversificación reduce la exposición a un único mercado o divisa, pero añade complejidad. No hay una respuesta única.",
      },
      {
        question: "¿Qué criterio pesa más al comparar mercados?",
        answer:
          "No hay un criterio universal. Para un inversor que prioriza preservar capital, el marco legal y la liquidez suelen pesar más; para quien busca renta, el perfil de demanda y la fiscalidad de los ingresos. El criterio dominante lo define el objetivo.",
      },
    ],
  },
  {
    slug: "preguntas-frecuentes-inversion-inmobiliaria",
    category: "Preguntas frecuentes",
    region: "Internacional",
    title: "Preguntas frecuentes sobre inversión inmobiliaria internacional",
    metaTitle: "Inversión inmobiliaria internacional: preguntas frecuentes",
    metaDescription:
      "Respuestas a las dudas más habituales sobre inversión inmobiliaria internacional: diligencia debida, fiscalidad, divisa, liquidez y cómo seleccionar oportunidades.",
    keywords: [
      "preguntas inversión inmobiliaria",
      "dudas invertir inmuebles",
      "faq real estate inversión",
      "cómo invertir en inmuebles",
    ],
    excerpt:
      "Respuestas claras y sin promesas a las dudas más comunes del inversor inmobiliario internacional.",
    readingTime: "6 min",
    updated: "Enero 2026",
    sections: [
      {
        heading: "Sobre el proceso de inversión",
        paragraphs: [
          "Invertir en inmuebles fuera del país de residencia implica entender procesos legales, fiscales y operativos distintos. Estas preguntas recogen las dudas más habituales que plantean los inversores antes de dar el paso.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Qué es la diligencia debida en una operación inmobiliaria?",
        answer:
          "Es el proceso de verificación previo a la compra: situación registral del inmueble, cargas, licencias, situación urbanística y estado legal. Su objetivo es confirmar que el activo es lo que aparenta y que la operación es segura.",
      },
      {
        question: "¿Puedo invertir sin viajar al país del inmueble?",
        answer:
          "En muchos casos sí, mediante poderes notariales y representación legal. No obstante, la decisión de hacerlo a distancia depende del nivel de confianza en los intermediarios y de la diligencia debida realizada.",
      },
      {
        question: "¿Garantiza rentabilidad una propiedad bien ubicada?",
        answer:
          "No. La ubicación es un factor relevante, pero ninguna inversión inmobiliaria garantiza rentabilidad. El valor puede subir o bajar según el ciclo de mercado, la divisa y factores locales. Cualquier afirmación de rentabilidad garantizada debe tratarse con escepticismo.",
      },
      {
        question: "¿Cómo se seleccionan las oportunidades que se presentan?",
        answer:
          "Cada oportunidad se analiza y valida individualmente antes de presentarse, atendiendo a su situación legal, ubicación y coherencia con el perfil del inversor. No se publican activos que no hayan pasado esa revisión.",
      },
    ],
  },
]

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug)
}

export function getAllGuideSlugs(): string[] {
  return guides.map((g) => g.slug)
}
