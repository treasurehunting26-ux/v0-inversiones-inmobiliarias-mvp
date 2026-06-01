/**
 * Cliente API publico para el catalogo de oportunidades.
 * Solo lectura. Solo propiedades publicadas (el backend filtra por status="published").
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export type Property = {
  id: string
  title: string
  location: string
  asset_type: string
  investment_range: string
  roi_estimated: string | null
  horizon: string
  risk_notes: string
}

export type PropertyListResponse = {
  properties: Property[]
  count: number
}

export const fetcher = async (path: string): Promise<PropertyListResponse> => {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export const propertyFetcher = async (path: string): Promise<Property> => {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" })
  if (!res.ok) {
    if (res.status === 404) throw new Error("NOT_FOUND")
    throw new Error(`Error ${res.status}`)
  }
  return res.json()
}
