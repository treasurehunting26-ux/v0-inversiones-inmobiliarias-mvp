"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

/**
 * Replica exactamente el <script> de la plantilla original: un
 * IntersectionObserver con threshold 0.12 y rootMargin "0px 0px -40px 0px"
 * que anade la clase "in" la primera vez que el bloque entra en el
 * viewport, y luego deja de observarlo.
 */
export function VlmReveal({
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

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${visible ? "in" : ""} ${className}`.trim()}>
      {children}
    </div>
  )
}
