const press = ["Forbes", "Financial Times", "Bloomberg", "The Wall Street Journal", "Idealista"]

export function Credibility() {
  return (
    <section className="border-y border-border bg-secondary py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="mb-10 text-center text-[0.7rem] font-light uppercase tracking-[0.3em] text-muted-foreground">
          Reconocidos por los medios de referencia
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16">
          {press.map((name) => (
            <span
              key={name}
              className="font-serif text-xl font-light italic text-foreground/55 transition-colors hover:text-foreground md:text-2xl"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
