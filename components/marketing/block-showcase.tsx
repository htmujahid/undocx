"use client"

const BLOCKS = [
  {
    title: "Tables",
    description:
      "Comparisons and structured data render as clean, sortable tables instead of comma-separated prose.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      </svg>
    ),
  },
  {
    title: "Code",
    description:
      "Snippets, commands, and config arrive in fenced, syntax-highlighted blocks, ready to copy and run.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: "Diagrams & charts",
    description:
      "Flowcharts, timelines, and visualizations are drawn as crisp inline SVG figures, not described in words.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    title: "Callouts",
    description:
      "Key insights, tips, warnings, and cautions are pulled out into clearly styled note, tip, warning, and danger blocks.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
  },
  {
    title: "Math",
    description:
      "Formulas and equations are typeset properly with block and inline math, no broken ASCII approximations.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="M5 7V5a1 1 0 0 1 1-1h12M5 7l7 5-7 5v2a1 1 0 0 0 1 1h12" />
        <path d="M9 4h9" />
      </svg>
    ),
  },
  {
    title: "Citations & footnotes",
    description:
      "References and sources are tracked as numbered footnotes, so claims stay traceable to where they came from.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        <path d="M9 7h6M9 11h4" />
      </svg>
    ),
  },
]

export function BlockShowcase() {
  return (
    <section className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Content blocks
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            One document, every kind of block
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Renderical doesn&apos;t just write paragraphs. It reaches for the
            right block for each idea and mixes them into a single, coherent
            document.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {BLOCKS.map((block) => (
            <div key={block.title} className="bg-background p-7">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {block.icon}
              </div>
              <h3 className="mt-5 font-semibold tracking-tight">
                {block.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {block.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
