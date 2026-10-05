import type { GuideId } from "./slugs"

export type GuideSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export type GuideFAQ = {
  question: string
  answer: string
}

/** Claves de categoria y region: el texto visible sale del diccionario. */
export type GuideCategory = "zone-guide" | "market-comparison" | "analysis" | "faq"
export type GuideRegion = "europe" | "latam" | "dubai" | "international"

export type Guide = {
  id: GuideId
  slug: string
  category: GuideCategory
  region: GuideRegion
  image: string
  title: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  excerpt: string
  readingTime: string
  updated: string
  /** Fecha ISO de la ultima revision (datos estructurados) */
  dateModified: string
  sections: GuideSection[]
  faqs: GuideFAQ[]
}
