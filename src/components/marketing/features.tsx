function OrganizationVisual() {
  const items = [
    { indent: 0, type: "folder", label: "Research", open: true },
    { indent: 1, type: "file", label: "Climate data analysis" },
    { indent: 1, type: "file", label: "Literature review", active: true },
    { indent: 0, type: "folder", label: "Projects", open: true },
    { indent: 1, type: "file", label: "Q3 roadmap" },
    { indent: 1, type: "file", label: "Competitor comparison" },
    { indent: 0, type: "folder", label: "Study materials" },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className="text-xs text-muted-foreground">
          Search knowledge base...
        </span>
        <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ⌘K
        </span>
      </div>

      <div className="space-y-0.5 p-2">
        {items.map((item, i) => (
          <div
            key={i}
            style={{ paddingLeft: item.indent * 16 + 8 }}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
              (item as any).active
                ? "bg-primary/8 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {item.type === "folder" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3 shrink-0"
              >
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3 shrink-0opacity-60"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {["#research", "#science", "#climate"].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function EditingVisual() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-border" />
          <div className="size-2.5 rounded-full bg-border" />
          <div className="size-2.5 rounded-full bg-border" />
        </div>
        <span className="text-xs text-muted-foreground">
          Introduction · Draft
        </span>
        <div className="w-16" />
      </div>

      <div className="space-y-2.5 p-6">
        <div className="h-2.5 w-full rounded-full bg-muted/70" />
        <div className="h-2.5 w-11/12 rounded-full bg-muted/70" />
        <div className="h-2.5 w-4/5 rounded-full bg-muted/70" />

        <div className="relative py-1">
          <div className="h-2.5 w-3/4 rounded-full bg-primary/20 ring-1 ring-primary/30" />
          <div className="absolute -top-9 left-0 flex items-center gap-px overflow-hidden rounded-lg border border-border bg-background shadow-lg">
            {[
              { label: "Rewrite", active: true },
              { label: "Expand", active: false },
              { label: "Simplify", active: false },
              { label: "Translate", active: false },
            ].map(({ label, active }) => (
              <button
                key={label}
                className={`px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-2.5 w-full rounded-full bg-muted/70" />
        <div className="h-2.5 w-5/6 rounded-full bg-muted/70" />
        <div className="h-2.5 w-full rounded-full bg-muted/70" />
        <div className="h-2.5 w-2/3 rounded-full bg-muted/70" />
      </div>
    </div>
  )
}

function LearningVisual() {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          className="absolute inset-x-3 top-2 h-full rounded-2xl border border-border bg-muted/40"
          style={{ transform: "rotate(2deg)" }}
        />
        <div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="text-xs font-medium text-muted-foreground">
              Biology · Cell division
            </span>
            <span className="text-xs text-muted-foreground">8 / 20</span>
          </div>
          <div className="px-5 pt-3 pb-1">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-1 rounded-full bg-primary"
                style={{ width: "40%" }}
              />
            </div>
          </div>
          <div className="px-5 py-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Question
            </p>
            <p className="mt-2 text-sm font-medium leading-snug">
              What is the primary difference between mitosis and meiosis?
            </p>
          </div>
          <div className="flex border-t border-border">
            <button className="flex-1 py-2.5 text-xs text-muted-foreground hover:bg-muted/40">
              ← Skip
            </button>
            <div className="w-px bg-border" />
            <button className="flex-1 py-2.5 text-xs font-medium text-primary hover:bg-primary/5">
              Show answer
            </button>
            <div className="w-px bg-border" />
            <button className="flex-1 py-2.5 text-xs text-muted-foreground hover:bg-muted/40">
              Got it →
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Cards due", value: "12" },
          { label: "Mastered", value: "34" },
          { label: "Streak", value: "7d" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-background p-3 text-center"
          >
            <p className="text-base font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

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
        className="size-5"
      >
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      </svg>
    ),
    title: "Smart organization",
    description:
      "Everything you generate lands in a persistent knowledge base. Organize with nested folders, tags, and collections. Full-text search across all your content, always findable, never lost.",
    visual: <OrganizationVisual />,
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
        className="size-5"
      >
        <path d="M12 20h9" />
        <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
      </svg>
    ),
    title: "AI-assisted inline editing",
    description:
      "Select any portion of your output (a sentence, a table row, a bullet point) and prompt the AI to rewrite, expand, simplify, or translate just that section. The rest stays untouched.",
    visual: <EditingVisual />,
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
        className="size-5"
      >
        <path d="M12 22V12" />
        <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
        <circle cx="12" cy="5" r="3" />
      </svg>
    ),
    title: "Learning tools",
    description:
      "Auto-generate flashcard decks and quizzes from any content. Track progress, review due cards, and build structured study guides, all from material you've already generated.",
    visual: <LearningVisual />,
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
            A complete workflow, from first draft to organized, searchable
            knowledge.
          </p>
        </div>

        <div className="mt-20 space-y-24">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16"
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                {feature.visual}
              </div>

              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
