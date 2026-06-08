import Link from "next/link"

const markets = [
  {
    name: "Europa",
    location: "Costa del Sol · Madrid · Lisboa",
    image: "/images/market-europa.png",
    description: "Activos consolidados en los mercados más estables y demandados del continente.",
  },
  {
    name: "Latinoamérica",
    location: "Tulum · Ciudad de México · Punta del Este",
    image: "/images/market-latam.png",
    description: "Oportunidades de alto crecimiento en destinos emergentes de lujo.",
  },
  {
    name: "Dubái",
    location: "Palm Jumeirah · Downtown · Marina",
    image: "/images/market-dubai.png",
    description: "Rentabilidades excepcionales en uno de los mercados más dinámicos del mundo.",
  },
]

export function Markets() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 max-w-2xl">
          <span className="text-xs font-light uppercase tracking-[0.3em] text-accent">Nuestros mercados</span>
          <h2 className="mt-5 font-serif text-4xl font-light leading-tight text-balance text-foreground md:text-5xl">
            Tres geografías, una misma exigencia
          </h2>
          <p className="mt-5 text-base font-light leading-relaxed text-muted-foreground">
            Seleccionamos activos en mercados internacionales con potencial verificado, combinando
            estabilidad patrimonial y oportunidades de revalorización.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {markets.map((market) => (
            <Link
              key={market.name}
              href="/oportunidades"
              className="group relative block overflow-hidden"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={market.image || "/placeholder.svg"}
                  alt={`Inversión inmobiliaria en ${market.name}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <div className="text-[0.7rem] font-light uppercase tracking-[0.2em] text-gold-soft">
                    {market.location}
                  </div>
                  <h3 className="mt-2 font-serif text-3xl font-light text-noir-foreground">{market.name}</h3>
                  <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-noir-foreground/75">
                    {market.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-light uppercase tracking-[0.2em] text-noir-foreground">
                    Explorar
                    <span className="h-px w-8 bg-gold transition-all duration-300 group-hover:w-12" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
