"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Guide } from "@/lib/guides"

const CATEGORY_ALL = "Todas"

function useUniqueValues(guides: Guide[], key: "category" | "region") {
  return useMemo(() => {
    const values = Array.from(new Set(guides.map((g) => g[key])))
    return values.sort()
  }, [guides, key])
}

export function GuidesIndex({ guides }: { guides: Guide[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>(CATEGORY_ALL)
  const [region, setRegion] = useState<string>(CATEGORY_ALL)

  const categories = useUniqueValues(guides, "category")
  const regions = useUniqueValues(guides, "region")

  const [featured, ...rest] = guides

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rest.filter((g) => {
      const matchesQuery =
        !q || g.title.toLowerCase().includes(q) || g.excerpt.toLowerCase().includes(q)
      const matchesCategory = category === CATEGORY_ALL || g.category === category
      const matchesRegion = region === CATEGORY_ALL || g.region === region
      return matchesQuery && matchesCategory && matchesRegion
    })
  }, [rest, query, category, region])

  const showFeatured = category === CATEGORY_ALL && region === CATEGORY_ALL && query.trim() === ""

  return (
    <>
      {/* Filtros + buscador */}
      <section className="border-b border-border bg-background px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[CATEGORY_ALL, ...categories].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${
                  category === c
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-noir)]"
                    : "border-border text-muted-foreground hover:border-[var(--color-gold)] hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              {[CATEGORY_ALL, ...regions].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors ${
                    region === r
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <label className="relative">
              <span className="sr-only">Buscar guías</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar guías..."
                className="w-full min-w-[220px] rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] sm:w-auto"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Destacado */}
      {showFeatured && featured && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">Destacado</p>
            <Link
              href={`/guias/${featured.slug}`}
              className="group grid overflow-hidden rounded-sm border border-border bg-card md:grid-cols-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto">
                <Image
                  src={featured.image || "/placeholder.svg"}
                  alt={featured.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-10">
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">
                    {featured.category}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {featured.region}
                  </span>
                </div>
                <h2 className="font-serif text-3xl font-light leading-tight text-foreground text-balance md:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {featured.readingTime} de lectura
                  </span>
                  <span className="text-sm text-[var(--color-gold)] transition-transform group-hover:translate-x-1">
                    Leer guía →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Grid de guías */}
      <section className={`px-6 pb-24 ${showFeatured ? "pt-0" : "pt-16"}`}>
        <div className="mx-auto max-w-5xl">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No encontramos guías que coincidan con tu búsqueda. Prueba con otro término o filtro.
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {filtered.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guias/${guide.slug}`}
                  className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-colors hover:border-[var(--color-gold)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={guide.image || "/placeholder.svg"}
                      alt={guide.title}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-8">
                    <div>
                      <div className="mb-5 flex items-center gap-3">
                        <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">
                          {guide.category}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {guide.region}
                        </span>
                      </div>
                      <h2 className="font-serif text-2xl font-light leading-snug text-foreground text-balance">
                        {guide.title}
                      </h2>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{guide.excerpt}</p>
                    </div>
                    <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {guide.readingTime} de lectura
                      </span>
                      <span className="text-sm text-[var(--color-gold)] transition-transform group-hover:translate-x-1">
                        Leer guía →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
