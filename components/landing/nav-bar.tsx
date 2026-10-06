"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n/client"
import { homeAnchor, localizedPath } from "@/lib/i18n/config"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const { locale, dict } = useI18n()
  const t = dict.nav

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-500 ${
        scrolled ? "border-b border-noir-foreground/10 bg-noir/90 backdrop-blur-md" : "bg-gradient-to-b from-noir/70 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:h-28 lg:px-10">
        <Link href={localizedPath(locale, "home")} className="flex items-center" aria-label={t.homeAria}>
          <Image
            src="/brand/logo-bg-consulting-v2.png"
            alt="B&G Consulting"
            width={577}
            height={614}
            priority
            className="h-20 w-auto lg:h-24"
          />
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {[
            { label: t.howItWorks, href: homeAnchor(locale, "como-funciona") },
            { label: t.opportunities, href: localizedPath(locale, "opportunities") },
            { label: t.guides, href: localizedPath(locale, "guides") },
            { label: t.about, href: homeAnchor(locale, "nosotros") },
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

        <div className="flex items-center gap-5 sm:gap-7">
          <LanguageSwitcher />
          <Link
            href={localizedPath(locale, "assistant")}
            className="hidden border border-gold-soft/80 px-6 py-2.5 text-xs font-light uppercase tracking-[0.18em] text-noir-foreground transition-colors hover:bg-gold-soft hover:text-noir sm:inline-block"
          >
            {t.talkToAdvisor}
          </Link>
        </div>
      </div>
    </header>
  )
}
