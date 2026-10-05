"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Dictionary } from "./dictionaries/es"
import type { Locale } from "./config"

type I18nValue = { locale: Locale; dict: Dictionary }

const I18nContext = createContext<I18nValue | null>(null)

/**
 * Da acceso al idioma y a los textos a los componentes de cliente.
 * El layout de servidor le pasa solo el diccionario del idioma activo,
 * asi el navegador no descarga los textos del resto de idiomas.
 */
export function I18nProvider({ locale, dict, children }: I18nValue & { children: ReactNode }) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error("useI18n debe usarse dentro de <I18nProvider>")
  return value
}
