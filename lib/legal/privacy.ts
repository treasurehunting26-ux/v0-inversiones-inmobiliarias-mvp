/**
 * Política de privacidad (RGPD + LOPDGDD).
 *
 * BORRADOR redactado a partir de lo que la web hace realmente con los datos
 * (formularios, solicitud privada, captación desde fuentes públicas,
 * proveedores). Debe revisarlo un abogado antes de publicarse.
 *
 * Datos de la empresa: completar en LEGAL_ENTITY. Mientras falte alguno,
 * la página muestra un aviso de borrador y no se indexa.
 */
import type { Locale } from "@/lib/i18n"

export const LEGAL_ENTITY = {
  /** Razón social (ej. "B&G Consulting Inversiones, S.L.") */
  name: "",
  /** NIF / CIF */
  taxId: "",
  /** Domicilio social completo */
  address: "",
  /** Email para privacidad y ejercicio de derechos */
  email: "",
  phone: "+34 681 96 44 84",
  /** Fecha de la última actualización (AAAA-MM-DD) */
  updated: "2026-10-30",
}

export const LEGAL_ENTITY_COMPLETE = Boolean(
  LEGAL_ENTITY.name && LEGAL_ENTITY.taxId && LEGAL_ENTITY.address && LEGAL_ENTITY.email,
)

export type PrivacySection = { title: string; paragraphs?: string[]; items?: string[] }

const missing = { es: "[pendiente]", en: "[pending]" }

function entity(locale: Locale) {
  const m = missing[locale] ?? missing.es
  return {
    name: LEGAL_ENTITY.name || m,
    taxId: LEGAL_ENTITY.taxId || m,
    address: LEGAL_ENTITY.address || m,
    email: LEGAL_ENTITY.email || m,
    phone: LEGAL_ENTITY.phone,
  }
}

export function privacyPolicy(locale: Locale): { title: string; intro: string; updatedLabel: string; draftNotice: string; sections: PrivacySection[] } {
  const e = entity(locale)
  if (locale === "en") {
    return {
      title: "Privacy policy",
      intro:
        "This policy explains how B&G Consulting handles the personal data of the people who visit this website, contact us or may be interested in our real estate opportunities, in accordance with the General Data Protection Regulation (GDPR) and the Spanish Organic Law 3/2018 (LOPDGDD).",
      updatedLabel: "Last updated",
      draftNotice: "Draft pending legal review and company details.",
      sections: [
        {
          title: "1. Data controller",
          items: [
            `Company: ${e.name}`,
            `Tax ID: ${e.taxId}`,
            `Registered address: ${e.address}`,
            `Email: ${e.email}`,
            `Phone and WhatsApp: ${e.phone}`,
          ],
        },
        {
          title: "2. Data we process and where it comes from",
          paragraphs: [
            "Data you give us. When you send a private request (the \"Speak to an advisor\" panel): name, email, phone, preferred contact channel and time, and what you are looking for (goal, market, budget and, where applicable, the property you were viewing). When you use the contact form: name, email and your message. When you write to us or call us by WhatsApp, phone or email: the content of that communication.",
            "Data from public sources. To identify people who have publicly expressed an interest in investing in real estate, we review news items and posts in open-access forums located through alerts (for example Google Alerts or RSS feeds). We may record the public name or alias, the published text, the link to the source and the date, together with an estimate of the investment profile. Every record is reviewed by a person before any use; none is contacted automatically.",
            "Technical data. IP address and language, used to protect the website against abuse and to show it in your language.",
          ],
        },
        {
          title: "3. Purposes and legal bases",
          items: [
            "To handle your request, contact you and send you suitable proposals. Legal basis: your consent and the steps you ask us to take before a possible contract (Art. 6(1)(a) and (b) GDPR).",
            "To manage and follow up the business relationship once established. Legal basis: performance of the contract and our legitimate interest (Art. 6(1)(b) and (f) GDPR).",
            "To identify potential investors from public sources and, after human review, offer them our services. Legal basis: legitimate interest in promoting our services (Art. 6(1)(f) GDPR). You may object at any time.",
            "To keep the website secure and prevent spam. Legal basis: legitimate interest (Art. 6(1)(f) GDPR).",
            "To comply with legal obligations, including, where a transaction goes ahead, those arising from anti-money-laundering legislation (Law 10/2010). Legal basis: legal obligation (Art. 6(1)(c) GDPR).",
          ],
        },
        {
          title: "4. Profiling and automated decisions",
          paragraphs: [
            "To prioritise requests and records from public sources we use tools, including artificial intelligence, that estimate an interest profile (market, budget, type of asset). This estimate never produces legal effects on you: a person always reviews it and decides whether to contact you. We do not take decisions based solely on automated processing.",
          ],
        },
        {
          title: "5. How long we keep your data",
          items: [
            "Requests and contacts: while the business relationship lasts and, if no transaction is formalised, for up to two years from the last contact.",
            "Records from public sources: deleted as soon as they are discarded on review, and in any case within the period set out in our internal procedure.",
            "Data subject to anti-money-laundering legislation: ten years, as required by law.",
            "Once these periods end, the data are deleted or kept blocked only for the period in which liabilities may arise.",
          ],
        },
        {
          title: "6. Who we share data with",
          paragraphs: [
            "We do not sell or transfer your data to third parties, except where required by law. We use service providers that process data on our behalf under a data processing agreement:",
          ],
          items: [
            "Vercel Inc.: website hosting and file storage.",
            "Railway Corporation: server and database.",
            "Zoho Corporation: email.",
            "Artificial intelligence providers (through Vercel AI Gateway): analysis of public-source texts and of property documents.",
            "WhatsApp (Meta Platforms): only if you choose to contact us through that channel.",
          ],
        },
        {
          title: "7. International transfers",
          paragraphs: [
            "Some of these providers may process data outside the European Economic Area, mainly in the United States. In those cases transfers are covered by the EU–US Data Privacy Framework or by the European Commission's standard contractual clauses.",
          ],
        },
        {
          title: "8. Your rights",
          paragraphs: [
            `You may request access to your data, its rectification or erasure, object to its processing or request its restriction or portability, and withdraw your consent at any time without affecting earlier processing. Write to ${e.email} stating which right you wish to exercise. We will respond within one month.`,
            "If you believe your rights have not been respected, you can lodge a complaint with the Spanish Data Protection Agency (www.aepd.es).",
          ],
        },
        {
          title: "9. Cookies",
          paragraphs: [
            "This website does not use advertising or analytics cookies. It only uses the technical storage needed for it to work (for example, keeping the language or a form open while you browse), which does not require consent.",
          ],
        },
        {
          title: "10. Minors",
          paragraphs: ["Our services are aimed at adults. We do not knowingly collect data from people under 18."],
        },
        {
          title: "11. Security",
          paragraphs: [
            "We apply technical and organisational measures appropriate to the risk: encrypted connections, restricted access to the management panel and limits against automated submissions.",
          ],
        },
        {
          title: "12. Changes to this policy",
          paragraphs: ["We may update this policy. The date of the last update appears at the top of this page."],
        },
      ],
    }
  }

  return {
    title: "Política de privacidad",
    intro:
      "Esta política explica cómo trata B&G Consulting los datos personales de quienes visitan esta web, se ponen en contacto con nosotros o pueden estar interesados en nuestras oportunidades inmobiliarias, conforme al Reglamento General de Protección de Datos (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).",
    updatedLabel: "Última actualización",
    draftNotice: "Borrador pendiente de revisión legal y de los datos de la empresa.",
    sections: [
      {
        title: "1. Responsable del tratamiento",
        items: [
          `Razón social: ${e.name}`,
          `NIF: ${e.taxId}`,
          `Domicilio: ${e.address}`,
          `Email: ${e.email}`,
          `Teléfono y WhatsApp: ${e.phone}`,
        ],
      },
      {
        title: "2. Qué datos tratamos y de dónde proceden",
        paragraphs: [
          "Datos que usted nos facilita. Cuando envía una solicitud privada (panel «Hablar con un asesor»): nombre, email, teléfono, canal y franja preferidos de contacto, y lo que busca (objetivo, mercado, presupuesto y, en su caso, la propiedad que estaba consultando). Cuando usa el formulario de contacto: nombre, email y su mensaje. Cuando nos escribe o llama por WhatsApp, teléfono o email: el contenido de esa comunicación.",
          "Datos obtenidos de fuentes públicas. Para identificar a personas que han manifestado públicamente su interés en invertir en inmuebles, revisamos noticias y publicaciones en foros de acceso público localizadas mediante alertas (por ejemplo, Google Alertas o canales RSS). Podemos registrar el nombre o alias público, el texto publicado, el enlace a la fuente y la fecha, junto con una estimación del perfil de inversión. Cada registro lo revisa una persona antes de cualquier uso; nadie es contactado de forma automática.",
          "Datos técnicos. Dirección IP e idioma, para proteger la web frente a abusos y mostrarla en su idioma.",
        ],
      },
      {
        title: "3. Finalidades y bases jurídicas",
        items: [
          "Atender su solicitud, contactarle y enviarle propuestas adecuadas. Base: su consentimiento y la aplicación de medidas precontractuales a petición suya (art. 6.1.a y 6.1.b RGPD).",
          "Gestionar y dar seguimiento a la relación comercial una vez establecida. Base: ejecución del contrato e interés legítimo (art. 6.1.b y 6.1.f RGPD).",
          "Identificar potenciales inversores a partir de fuentes públicas y, tras revisión humana, ofrecerles nuestros servicios. Base: interés legítimo en dar a conocer nuestros servicios (art. 6.1.f RGPD). Puede oponerse en cualquier momento.",
          "Mantener la seguridad de la web y prevenir el spam. Base: interés legítimo (art. 6.1.f RGPD).",
          "Cumplir obligaciones legales, incluidas, si se llega a formalizar una operación, las derivadas de la normativa de prevención del blanqueo de capitales (Ley 10/2010). Base: obligación legal (art. 6.1.c RGPD).",
        ],
      },
      {
        title: "4. Elaboración de perfiles y decisiones automatizadas",
        paragraphs: [
          "Para priorizar las solicitudes y los registros procedentes de fuentes públicas utilizamos herramientas, incluida la inteligencia artificial, que estiman un perfil de interés (mercado, presupuesto, tipo de activo). Esta estimación nunca produce efectos jurídicos sobre usted: siempre la revisa una persona, que decide si contactarle. No tomamos decisiones basadas únicamente en tratamientos automatizados.",
        ],
      },
      {
        title: "5. Plazo de conservación",
        items: [
          "Solicitudes y contactos: mientras dure la relación comercial y, si no se formaliza ninguna operación, hasta dos años desde el último contacto.",
          "Registros procedentes de fuentes públicas: se eliminan en cuanto se descartan en la revisión y, en todo caso, en el plazo fijado en nuestro procedimiento interno.",
          "Datos sujetos a la normativa de prevención del blanqueo de capitales: diez años, conforme a la ley.",
          "Transcurridos estos plazos, los datos se suprimen o se conservan bloqueados únicamente durante el plazo de prescripción de las posibles responsabilidades.",
        ],
      },
      {
        title: "6. Destinatarios",
        paragraphs: [
          "No vendemos ni cedemos sus datos a terceros, salvo obligación legal. Trabajamos con proveedores que tratan datos por cuenta nuestra con un contrato de encargo de tratamiento:",
        ],
        items: [
          "Vercel Inc.: alojamiento de la web y almacenamiento de archivos.",
          "Railway Corporation: servidor y base de datos.",
          "Zoho Corporation: correo electrónico.",
          "Proveedores de inteligencia artificial (a través de Vercel AI Gateway): análisis de textos de fuentes públicas y de documentos de propiedades.",
          "WhatsApp (Meta Platforms): solo si usted elige contactarnos por ese canal.",
        ],
      },
      {
        title: "7. Transferencias internacionales",
        paragraphs: [
          "Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo, principalmente en Estados Unidos. En esos casos las transferencias se amparan en el Marco de Privacidad de Datos UE-EE. UU. o en las cláusulas contractuales tipo de la Comisión Europea.",
        ],
      },
      {
        title: "8. Sus derechos",
        paragraphs: [
          `Puede solicitar el acceso a sus datos, su rectificación o supresión, oponerse a su tratamiento o pedir su limitación o portabilidad, así como retirar su consentimiento en cualquier momento sin que ello afecte a los tratamientos anteriores. Escriba a ${e.email} indicando el derecho que desea ejercer. Le responderemos en el plazo de un mes.`,
          "Si considera que no se han respetado sus derechos, puede presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).",
        ],
      },
      {
        title: "9. Cookies",
        paragraphs: [
          "Esta web no utiliza cookies publicitarias ni de análisis. Solo usa el almacenamiento técnico necesario para su funcionamiento (por ejemplo, mantener el idioma o un formulario abierto mientras navega), que no requiere consentimiento.",
        ],
      },
      {
        title: "10. Menores",
        paragraphs: ["Nuestros servicios se dirigen a personas mayores de edad. No recogemos de forma consciente datos de menores de 18 años."],
      },
      {
        title: "11. Seguridad",
        paragraphs: [
          "Aplicamos medidas técnicas y organizativas adecuadas al riesgo: conexiones cifradas, acceso restringido al panel de gestión y límites frente a envíos automatizados.",
        ],
      },
      {
        title: "12. Cambios en esta política",
        paragraphs: ["Podemos actualizar esta política. La fecha de la última actualización figura al inicio de esta página."],
      },
    ],
  }
}
