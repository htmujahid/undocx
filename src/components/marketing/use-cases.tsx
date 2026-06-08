function FlashcardVisual() {
  return (
    <div className="relative flex items-center justify-center py-4">
      <div
        className="absolute rounded-2xl border border-border bg-background/60"
        style={{ width: 240, height: 130, transform: "rotate(3deg) translateY(6px)" }}
      />
      <div className="relative w-60 rounded-2xl border border-border bg-background shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="text-xs font-medium text-muted-foreground">Flashcard</span>
          <span className="text-xs text-muted-foreground">12 / 24</span>
        </div>
        <div className="px-4 pt-3 pb-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-1 w-1/2 rounded-full bg-primary" />
          </div>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Question
          </p>
          <p className="mt-1.5 text-sm font-medium">What is photosynthesis?</p>
        </div>
        <div className="border-t border-border px-4 py-2.5">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>← Skip</span>
            <span className="rounded-md bg-muted px-3 py-1 font-medium text-foreground">
              Show answer
            </span>
            <span>Got it →</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MindMapVisual() {
  const cx = 130
  const cy = 90
  const nodes = [
    { label: "Theory", x: 30, y: 25 },
    { label: "Data", x: 228, y: 25 },
    { label: "Sources", x: 30, y: 155 },
    { label: "Results", x: 228, y: 155 },
  ]

  return (
    <svg viewBox="0 0 260 185" className="w-56">
      {nodes.map((n) => (
        <line
          key={n.label}
          x1={cx}
          y1={cy}
          x2={n.x + 22}
          y2={n.y + 16}
          stroke="currentColor"
          strokeWidth="1"
          className="text-border"
        />
      ))}
      {nodes.map((n) => (
        <g key={n.label}>
          <rect
            x={n.x}
            y={n.y}
            width={52}
            height={32}
            rx={8}
            className="fill-background stroke-border"
            strokeWidth="1"
          />
          <text
            x={n.x + 26}
            y={n.y + 20}
            textAnchor="middle"
            fontSize={9}
            className="fill-muted-foreground"
            fontFamily="inherit"
          >
            {n.label}
          </text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={28} className="fill-primary" />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize={9}
        fill="white"
        fontFamily="inherit"
        fontWeight="500"
      >
        Research
      </text>
      <text
        x={cx}
        y={cy + 9}
        textAnchor="middle"
        fontSize={9}
        fill="white"
        fontFamily="inherit"
        fontWeight="500"
      >
        Topic
      </text>
    </svg>
  )
}

function FolderTreeVisual() {
  const items = [
    { indent: 0, type: "folder", label: "Project Alpha" },
    { indent: 1, type: "file", label: "Process doc" },
    { indent: 1, type: "file", label: "Comparison table" },
    { indent: 1, type: "file", label: "Onboarding guide" },
    { indent: 0, type: "folder", label: "Research" },
    { indent: 1, type: "file", label: "Literature review" },
  ]

  return (
    <div className="w-56 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="border-b border-border bg-muted/50 px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">Knowledge base</p>
      </div>
      <div className="px-2 py-2 space-y-0.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs"
            style={{ paddingLeft: item.indent * 16 + 8 }}
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
                className="size-3 shrink-0 text-muted-foreground"
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
                className="size-3 shrink-0 text-muted-foreground/50"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            )}
            <span
              className={
                item.type === "folder"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TextEditorVisual() {
  return (
    <div className="w-72 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-3 py-2">
        <div className="size-2 rounded-full bg-border" />
        <div className="size-2 rounded-full bg-border" />
        <div className="size-2 rounded-full bg-border" />
        <span className="ml-2 text-xs text-muted-foreground">Draft — Introduction</span>
      </div>
      <div className="space-y-2 p-4">
        <div className="h-2.5 w-full rounded-full bg-muted/60" />
        <div className="h-2.5 w-5/6 rounded-full bg-muted/60" />
        <div className="relative">
          <div className="h-2.5 w-4/5 rounded-full bg-primary/15" />
          <div
            className="absolute -top-7 left-0 flex items-center gap-px rounded-lg border border-border bg-background shadow-md px-1 py-1"
          >
            {["Rewrite", "Expand", "Simplify"].map((action, i) => (
              <span
                key={action}
                className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {action}
              </span>
            ))}
          </div>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted/60" />
        <div className="h-2.5 w-3/4 rounded-full bg-muted/60" />
        <div className="h-2.5 w-5/6 rounded-full bg-muted/60" />
      </div>
    </div>
  )
}

const USE_CASES = [
  {
    audience: "Students",
    headline: "Study smarter, not harder",
    description:
      "Turn lecture notes into flashcard decks, generate structured study guides, and build a personal knowledge base that grows with every course.",
    visual: <FlashcardVisual />,
    span: "lg:col-span-2",
  },
  {
    audience: "Researchers",
    headline: "Capture and connect ideas",
    description:
      "Organize findings across topics, convert raw material into structured formats, and refine iteratively as your research evolves.",
    visual: <MindMapVisual />,
    span: "lg:col-span-1",
  },
  {
    audience: "Teams",
    headline: "Shared knowledge that sticks",
    description:
      "Generate process docs and onboarding material that lives in a shared, structured base — not buried in a chat thread.",
    visual: <FolderTreeVisual />,
    span: "lg:col-span-1",
  },
  {
    audience: "Writers & Creators",
    headline: "Drafts that match your intent",
    description:
      "Generate in the layout that fits your goal, then refine any section inline — no more starting over from scratch.",
    visual: <TextEditorVisual />,
    span: "lg:col-span-2",
  },
]

export function UseCases() {
  return (
    <section className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Use cases
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for how you actually work
          </h2>
          <p className="mt-4 text-muted-foreground">
            Adapts to your workflow — whatever you're working on.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc) => (
            <div
              key={uc.audience}
              className={`overflow-hidden rounded-2xl border border-border bg-background ${uc.span}`}
            >
              <div className="flex min-h-48 items-center justify-center bg-muted/40 p-8">
                {uc.visual}
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {uc.audience}
                </p>
                <h3 className="mt-1.5 text-base font-semibold">{uc.headline}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {uc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
