import Link from "next/link"

export function Showcase() {
  return (
    <section className="bg-background">
      <div className="grid items-stretch lg:grid-cols-2">
        {/* Image */}
        <div className="relative min-h-[420px] lg:min-h-[640px]">
          <img
            src="/images/interior-lounge.png"
            alt="Salón interior de villa de lujo con vistas al mar"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col justify-center gap-8 px-6 py-20 lg:px-20 lg:py-0">
          <span className="text-xs font-light uppercase tracking-[0.35em] text-gold">Nuestra filosofía</span>
          <h2 className="max-w-xl font-serif text-4xl font-light leading-tight text-balance text-foreground md:text-5xl">
            La excelencia se mide en los detalles
          </h2>
          <p className="max-w-lg text-base font-light leading-relaxed text-muted-foreground">
            No publicamos catálogos interminables. Seleccionamos un número reducido de activos
            extraordinarios y dedicamos a cada uno el análisis que merece: rentabilidad, ubicación,
            potencial de revalorización y riesgo, documentados con el rigor que exige su patrimonio.
          </p>
          <div className="flex flex-col gap-6 pt-2">
            {[
              { k: "Selección curada", v: "Solo activos que superan nuestros criterios de inversión." },
              { k: "Alcance internacional", v: "Oportunidades en Europa, Latinoamérica y Dubái." },
              { k: "Acompañamiento experto", v: "Un asesor dedicado en cada paso de la operación." },
            ].map((item) => (
              <div key={item.k} className="flex gap-5 border-t border-border pt-5">
                <span className="font-serif text-lg font-light text-gold">—</span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium uppercase tracking-[0.12em] text-foreground">{item.k}</span>
                  <span className="text-sm font-light text-muted-foreground">{item.v}</span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/oportunidades"
            className="mt-2 w-fit border border-foreground/30 px-8 py-3.5 text-xs font-light uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Explorar la selección
          </Link>
        </div>
      </div>
    </section>
  )
}
