"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-500 ${
        scrolled ? "border-b border-noir-foreground/10 bg-noir/90 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="font-serif text-xl font-medium tracking-[0.2em] text-noir-foreground uppercase"
        >
          Aterra
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {[
            { label: "Cómo funciona", href: "/#como-funciona" },
            { label: "Oportunidades", href: "/oportunidades" },
            { label: "Guías", href: "/guias" },
            { label: "Nosotros", href: "/#nosotros" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-light uppercase tracking-[0.18em] text-noir-foreground/80 transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/asistente"
          className="border border-gold/60 px-6 py-2.5 text-xs font-light uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-noir"
        >
          Hablar con un asesor
        </Link>
      </div>
    </header>
  )
}
