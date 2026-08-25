"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

/**
 * Envuelve una seccion del dossier para que aparezca con una transicion
 * suave (opacidad + desplazamiento) cuando entra en el viewport, igual
 * que el documento de referencia. Respeta prefers-reduced-motion via CSS.
 */
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`dossier-reveal ${visible ? "in" : ""} ${className}`}>
      {children}
    </div>
  )
}
