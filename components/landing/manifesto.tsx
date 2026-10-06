"use client"

import { useEffect, useRef, useState } from "react"
import type { Dictionary } from "@/lib/i18n"

/**
 * Frase grande que se "llena" palabra a palabra según se baja
 * (las palabras pasan de gris claro a azul marino). Con "reducir
 * movimiento" se muestra entera desde el principio.
 */
export function Manifesto({ t }: { t: Dictionary["home"]["manifesto"] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const words = t.text.split(" ")

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1)
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 cuando el bloque asoma por abajo; 1 cuando su final pasa el 40 % de la pantalla
      const p = (vh * 0.85 - rect.top) / (rect.height + vh * 0.45)
      setProgress(Math.min(1, Math.max(0, p)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const lit = Math.round(progress * words.length)

  return (
    <section className="bg-background">
      <div ref={ref} className="mx-auto max-w-6xl px-6 py-28 md:py-40 lg:px-10">
        <span className="flex items-center gap-4 text-xs font-light uppercase tracking-[0.35em] text-copper-ink">
          <span className="h-px w-10 bg-copper" aria-hidden />
          {t.eyebrow}
        </span>
        <p className="mt-10 font-serif text-3xl font-light leading-[1.25] md:text-5xl lg:text-[3.6rem]">
          <span className="sr-only">{t.text}</span>
          <span aria-hidden>
            {words.map((word, i) => (
              <span
                key={i}
                className="transition-colors duration-500"
                style={{ color: i < lit ? "var(--color-noir)" : "rgba(31, 47, 77, 0.16)" }}
              >
                {word}{" "}
              </span>
            ))}
          </span>
        </p>
      </div>
    </section>
  )
}
