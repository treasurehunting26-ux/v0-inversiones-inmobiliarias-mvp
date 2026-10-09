"use client"

import Link from "next/link"
import { useRef, useState } from "react"

/**
 * Tarjeta de mercado: foto fija y, en escritorio, un clip corto que se
 * reproduce al pasar el ratón (o al enfocarla con el teclado). El vídeo no se
 * descarga hasta ese momento. En móvil y con "reducir movimiento", solo foto.
 */
export function MarketCard({
  href,
  poster,
  video,
  alt,
  children,
}: {
  href: string
  poster: string
  video: string
  alt: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const canPlay = () =>
    !!video &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const start = () => {
    const el = ref.current
    if (!el || !canPlay()) return
    if (!el.src) el.src = video
    void el.play().then(() => setPlaying(true)).catch(() => {})
  }
  const stop = () => {
    ref.current?.pause()
    setPlaying(false)
  }

  return (
    <Link
      href={href}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      className="group relative block overflow-hidden"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={poster}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {video && (
          <video
            ref={ref}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              playing ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/20 to-transparent" />
        {children}
      </div>
    </Link>
  )
}
