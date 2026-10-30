/**
 * Solicitud privada ("Hablar con un asesor"): opciones, selección de
 * propiedades que encajan y mensaje para WhatsApp.
 */
import type { Property } from "@/lib/properties-api"
import { isCategory, type Category } from "@/lib/categories"
import { priceFromRange } from "@/lib/seo"

/** WhatsApp del equipo (formato internacional, sin "+" ni espacios). */
export const WHATSAPP_NUMBER = "34681964484"
export const PHONE_DISPLAY = "+34 681 96 44 84"
export const PHONE_TEL = "+34681964484"

export const GOALS = ["home", "income", "growth", "project", "commercial"] as const
export const MARKETS = ["marbella", "spain", "latam", "dubai", "open"] as const
export const BUDGETS = ["lt1", "1to2", "2to5", "gt5", "private"] as const
export const CHANNELS = ["whatsapp", "call", "email"] as const
export const TIMES = ["morning", "afternoon", "any"] as const

export type Goal = (typeof GOALS)[number]
export type Market = (typeof MARKETS)[number]
export type Budget = (typeof BUDGETS)[number]
export type Channel = (typeof CHANNELS)[number]
export type Time = (typeof TIMES)[number]

const GOAL_CATEGORIES: Record<Goal, Category[]> = {
  home: ["prime"],
  income: ["prime", "commercial"],
  growth: ["prime", "value_add", "development"],
  project: ["development", "value_add"],
  commercial: ["commercial"],
}

const BUDGET_RANGES: Record<Exclude<Budget, "private">, [number, number]> = {
  lt1: [0, 1_000_000],
  "1to2": [1_000_000, 2_000_000],
  "2to5": [2_000_000, 5_000_000],
  gt5: [5_000_000, Infinity],
}

const LATAM = ["venezuela", "caracas", "margarita", "nueva esparta", "mexico", "tulum", "punta del este", "uruguay",
  "colombia", "panama", "dominicana", "costa rica", "argentina", "chile", "peru", "brasil", "ecuador"]
const DUBAI = ["dubai", "emirat", "uae", "abu dhabi"]
const MARBELLA = ["marbella", "costa del sol", "sierra blanca", "benahavis", "estepona", "nueva andalucia",
  "puerto banus", "los monteros", "malaga", "milla de oro", "guadalmina", "sotogrande"]

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const hasAny = (text: string, words: string[]) => words.some((w) => text.includes(w))

function matchesMarket(location: string, market: Market): boolean {
  const loc = norm(location)
  switch (market) {
    case "open":
      return true
    case "latam":
      return hasAny(loc, LATAM)
    case "dubai":
      return hasAny(loc, DUBAI)
    case "marbella":
      return hasAny(loc, MARBELLA)
    case "spain":
      return !hasAny(loc, LATAM) && !hasAny(loc, DUBAI)
  }
}

function matchesBudget(range: string, budget: Budget): boolean {
  if (budget === "private") return true
  const price = priceFromRange(range)
  if (price === null) return true // "Precio bajo consulta": lo valora el asesor
  const [min, max] = BUDGET_RANGES[budget]
  return price >= min * 0.8 && price <= max * 1.2
}

/** Hasta 3 propiedades publicadas que encajan con la solicitud. */
export function matchProperties(
  properties: Property[],
  { goal, market, budget }: { goal: Goal; market: Market; budget: Budget },
): Property[] {
  const order = GOAL_CATEGORIES[goal]
  return properties
    .filter((p) => isCategory(p.category) && order.includes(p.category))
    .filter((p) => matchesMarket(p.location ?? "", market))
    .filter((p) => matchesBudget(p.investment_range ?? "", budget))
    .sort((a, b) => order.indexOf(a.category as Category) - order.indexOf(b.category as Category))
    .slice(0, 3)
}

export function whatsappLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
