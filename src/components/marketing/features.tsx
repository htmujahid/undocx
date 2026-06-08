const FEATURES = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
      >
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      </svg>
    ),
    title: "Smart organization",
    description:
      "Everything you generate is stored in a persistent knowledge base. Organize with nested folders, multiple tags, and custom collections. Full-text search across all your content.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
      >
        <path d="M12 20h9" />
        <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
      </svg>
    ),
    title: "AI-assisted inline editing",
    description:
      "Select any portion of your output — a sentence, a table row, a bullet — and prompt the AI to rewrite, expand, simplify, or translate just that section without touching the rest.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
      >
        <path d="M12 22V12" />
        <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
        <circle cx="12" cy="5" r="3" />
      </svg>
    ),
    title: "Learning tools",
    description:
      "Auto-generate flashcard decks, quizzes, and study guides from any piece of content. Condense long material into key takeaways and build structured study plans.",
  },
]

export function Features() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            More than generation
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete workflow — from first draft to organized, searchable knowledge.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-8 transition-shadow duration-200 hover:shadow-md"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                {feature.icon}
              </div>
              <h3 className="mt-6 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
