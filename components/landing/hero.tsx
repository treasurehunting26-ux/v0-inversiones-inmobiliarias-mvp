"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import type { Dictionary, Locale } from "@/lib/i18n"
import { localizedPath } from "@/lib/i18n/config"
import { HERO_MEDIA, HERO_VIDEO_ON_DESKTOP } from "@/lib/home-media"

/**
 * Portada con vídeo.
 * - Vídeo vertical: en móvil ocupa toda la pantalla; en escritorio va
 *   enmarcado a la derecha del titular (así no se pixela al estirarse).
 * - Vídeo horizontal: pantalla completa en todos los tamaños.
 * Siempre con un velo azul marino (no negro) para que el texto se lea.
 * Con "reducir movimiento" activado, el vídeo se queda en su primer fotograma.
 */
export function Hero({ locale, t }: { locale: Locale; t: Dictionary["hero"] }) {
  const landscape = HERO_MEDIA.orientation === "landscape"
  // Con un vídeo de poca resolución, en escritorio va la foto en lugar del vídeo
  const photoOnDesktop = landscape && !HERO_VIDEO_ON_DESKTOP

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-noir">
      {/* Fondo: vídeo a pantalla completa (móvil siempre; escritorio si es horizontal y nítido) */}
      <div className={`absolute inset-0 ${landscape && !photoOnDesktop ? "" : "lg:hidden"}`}>
        <HeroVideo label={t.videoLabel} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/70 via-noir/50 to-noir/80" />
      </div>

      {/* Escritorio con vídeo de poca resolución: foto a pantalla completa con zoom lento */}
      {photoOnDesktop && (
        <div className="absolute inset-0 hidden lg:block">
          <img src={HERO_MEDIA.poster} alt="" aria-hidden className="bg-kenburns h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-noir/70 via-noir/50 to-noir/80" />
        </div>
      )}

      {/* Escritorio con vídeo vertical: foto aérea de fondo con zoom lento */}
      {!landscape && (
        <div className="absolute inset-0 hidden lg:block">
          <img src={HERO_MEDIA.poster} alt="" aria-hidden className="bg-kenburns h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-noir/90 via-noir/70 to-noir/45" />
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl items-center px-6 pb-24 pt-32 lg:px-10">
        <div className={`grid w-full items-center gap-14 ${landscape ? "" : "lg:grid-cols-[1.25fr_0.75fr]"}`}>
          <div className={landscape ? "mx-auto max-w-4xl text-center" : "text-center lg:text-left"}>
            <span
              className="bg-rise inline-block text-base font-normal text-gold-soft"
              style={{ animationDelay: "150ms" }}
            >
              {t.eyebrow}
            </span>
            <h1 className="mt-6 font-serif font-normal leading-[1.04] tracking-[-0.01em] text-noir-foreground">
              <span className="bg-rise block text-5xl md:text-7xl lg:text-[5.4rem]" style={{ animationDelay: "300ms" }}>
                {t.titleLead}
              </span>
              <span
                className="bg-rise block text-5xl md:text-7xl lg:text-[5.4rem]"
                style={{ animationDelay: "480ms" }}
              >
                {t.titleAccent}
              </span>
            </h1>
            <p
              className={`bg-rise mt-8 max-w-xl text-base font-light leading-relaxed text-noir-foreground/85 md:text-lg ${
                landscape ? "mx-auto" : "mx-auto lg:mx-0"
              }`}
              style={{ animationDelay: "650ms" }}
            >
              {t.body}
            </p>
            <div
              className={`bg-rise mt-10 flex flex-col gap-4 sm:flex-row ${
                landscape ? "justify-center" : "justify-center lg:justify-start"
              }`}
              style={{ animationDelay: "800ms" }}
            >
              <Link
                href={localizedPath(locale, "opportunities")}
                className="bg-copper-ink px-9 py-4 text-center text-sm font-normal tracking-[0.01em] text-white transition-colors hover:bg-copper"
              >
                {t.primary}
              </Link>
              <Link
                href={localizedPath(locale, "assistant")}
                className="border border-gold-soft/70 px-9 py-4 text-center text-sm font-light tracking-[0.01em] text-noir-foreground transition-colors hover:border-noir-foreground hover:bg-noir-foreground/10"
              >
                {t.secondary}
              </Link>
            </div>
          </div>

          {/* Vídeo vertical enmarcado (solo escritorio) */}
          {!landscape && (
            <div className="bg-rise relative hidden justify-self-end lg:block" style={{ animationDelay: "550ms" }}>
              <div className="absolute -inset-3 border border-gold-soft/40" aria-hidden />
              <div className="relative aspect-[9/16] h-[68vh] max-h-[720px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
                <HeroVideo label={t.videoLabel} className="h-full w-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indicador para bajar */}
      <div className="absolute inset-x-0 bottom-7 z-10 flex flex-col items-center gap-2 text-noir-foreground/80">
        <span className="text-[0.82rem] font-light tracking-[0.01em]">{t.scroll}</span>
        <span className="bg-cue block h-8 w-px bg-gold-soft" aria-hidden />
      </div>
    </section>
  )
}

function HeroVideo({ label, className }: { label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    // Hay dos vídeos (móvil / escritorio) y solo uno visible: el oculto no se
    // reproduce ni se descarga.
    const sync = () => {
      const visible = video.getClientRects().length > 0
      if (reduce.matches || !visible) video.pause()
      else void video.play().catch(() => {})
    }
    sync()
    reduce.addEventListener("change", sync)
    window.addEventListener("resize", sync)
    return () => {
      reduce.removeEventListener("change", sync)
      window.removeEventListener("resize", sync)
    }
  }, [])

  return (
    <video
      ref={ref}
      className={className}
      src={HERO_MEDIA.video}
      poster={HERO_MEDIA.poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  )
}
