"use client"

import Link from "next/link"
import { NavBar } from "@/components/landing/nav-bar"
import { Footer } from "@/components/landing/footer"
import { useI18n } from "@/lib/i18n/client"
import { localizedPath } from "@/lib/i18n/config"

export default function NotFound() {
  const { locale, dict } = useI18n()
  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      <section className="bg-noir px-6 pb-28 pt-44 text-center">
        <h1 className="font-serif text-5xl font-light text-noir-foreground">{dict.notFound.title}</h1>
        <p className="mx-auto mt-6 max-w-md text-base font-light text-noir-foreground/60">{dict.notFound.body}</p>
        <Link
          href={localizedPath(locale, "home")}
          className="mt-10 inline-block border border-gold px-9 py-3.5 text-sm font-light tracking-[0.01em] text-gold transition-colors hover:bg-gold hover:text-noir"
        >
          {dict.notFound.home}
        </Link>
      </section>
      <Footer />
    </main>
  )
}
