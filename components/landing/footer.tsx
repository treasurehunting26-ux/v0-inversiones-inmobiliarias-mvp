"use client"

import Image from "next/image"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/client"
import { homeAnchor, localizedPath } from "@/lib/i18n/config"

export function Footer() {
  const { locale, dict } = useI18n()
  const t = dict.footer
  const linkClass = "text-sm font-light text-noir-foreground/60 transition-colors hover:text-noir-foreground"

  return (
    <footer className="bg-noir">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="flex flex-col gap-12 border-t border-noir-foreground/10 pt-12 md:flex-row md:justify-between">
          <div className="flex max-w-sm flex-col gap-4">
            <Image
              src="/brand/logo-bg-consulting-v2.png"
              alt="B&G Consulting"
              width={577}
              height={614}
              className="h-24 w-auto self-start"
            />
            <p className="text-sm font-light leading-relaxed text-noir-foreground/50">{t.tagline}</p>
          </div>

          <div className="flex gap-16">
            <nav className="flex flex-col gap-4">
              <span className="text-sm font-light tracking-[0.01em] text-gold">{t.platform}</span>
              <Link href={homeAnchor(locale, "como-funciona")} className={linkClass}>
                {t.howItWorks}
              </Link>
              <Link href={localizedPath(locale, "opportunities")} className={linkClass}>
                {t.opportunities}
              </Link>
              <Link href={localizedPath(locale, "guides")} className={linkClass}>
                {t.guides}
              </Link>
              <Link href={localizedPath(locale, "assistant")} className={linkClass}>
                {t.talkToAdvisor}
              </Link>
              <Link href={localizedPath(locale, "contact")} className={linkClass}>
                {t.contact}
              </Link>
            </nav>
            <nav className="flex flex-col gap-4">
              <span className="text-sm font-light tracking-[0.01em] text-gold">{t.markets}</span>
              {t.marketNames.map((name) => (
                <span key={name} className="text-sm font-light text-noir-foreground/60">
                  {name}
                </span>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-noir-foreground/10 pt-8">
          <p className="text-xs font-light leading-relaxed text-noir-foreground/40">
            © {new Date().getFullYear()} B&amp;G Consulting. {t.legal}
          </p>
        </div>
      </div>
    </footer>
  )
}
