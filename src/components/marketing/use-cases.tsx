function QuizVisual() {
  const options = [
    { label: "A", text: "It produces ATP through glycolysis only", correct: false },
    { label: "B", text: "It converts light energy into chemical energy", correct: true },
    { label: "C", text: "It breaks down glucose into carbon dioxide", correct: false },
    { label: "D", text: "It occurs exclusively in animal cells", correct: false },
  ]

  return (
    <div className="w-full max-w-xs overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-[11px] font-medium text-muted-foreground">Biology Quiz</span>
        <div className="flex items-center gap-2">
          <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
            <div className="h-1 w-2/5 rounded-full bg-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground">4 / 10</span>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-[11px] font-medium text-muted-foreground">Question 4</p>
        <p className="mt-1 text-xs font-medium leading-snug">
          What is the primary function of photosynthesis?
        </p>
        <div className="mt-3 space-y-1.5">
          {options.map((opt) => (
            <div
              key={opt.label}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[11px] transition-colors ${
                opt.correct
                  ? "border-primary/40 bg-primary/8 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              <span className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${opt.correct ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {opt.label}
              </span>
              {opt.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MindMapVisual() {
  const cx = 148
  const cy = 112
  const r = 78
  const branches = [
    { label: "Theory",  angle: -90 },
    { label: "Data",    angle: -30 },
    { label: "Results", angle:  30 },
    { label: "Impact",  angle:  90 },
    { label: "Methods", angle: 150 },
    { label: "Sources", angle: 210 },
  ]

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const nodeW = 58
  const nodeH = 26

  return (
    <svg viewBox="0 0 296 224" className="w-full">
      {branches.map((b) => {
        const nx = cx + r * Math.cos(toRad(b.angle))
        const ny = cy + r * Math.sin(toRad(b.angle))
        const edgeX = cx + 34 * Math.cos(toRad(b.angle))
        const edgeY = cy + 34 * Math.sin(toRad(b.angle))
        return (
          <line key={b.label}
            x1={edgeX} y1={edgeY} x2={nx} y2={ny}
            stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
        )
      })}
      {branches.map((b) => {
        const nx = cx + r * Math.cos(toRad(b.angle))
        const ny = cy + r * Math.sin(toRad(b.angle))
        return (
          <g key={b.label}>
            <rect
              x={nx - nodeW / 2} y={ny - nodeH / 2}
              width={nodeW} height={nodeH} rx={7}
              fill="white" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"
            />
            <text x={nx} y={ny + 4} textAnchor="middle" fontSize={8.5}
              fill="currentColor" fillOpacity="0.55" fontFamily="inherit">{b.label}</text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={33} fill="oklch(0.457 0.24 277.023)" />
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize={9} fill="white" fontFamily="inherit" fontWeight="600">Research</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize={9} fill="white" fontFamily="inherit" fontWeight="600">Topic</text>
    </svg>
  )
}

function KanbanVisual() {
  const columns = [
    {
      title: "To do",
      color: "text-muted-foreground",
      dot: "bg-muted-foreground/50",
      items: ["Onboarding doc", "API guide", "Style guide", "Release notes"],
    },
    {
      title: "In progress",
      color: "text-primary",
      dot: "bg-primary",
      items: ["Process map", "SOPs draft", "Brand guidelines"],
    },
    {
      title: "Done",
      color: "text-green-600",
      dot: "bg-green-500",
      items: ["Team handbook", "Q3 retro", "Brand kit", "Org chart"],
    },
  ]

  return (
    <div className="flex w-full flex-col gap-2.5 py-6">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-[10px] font-semibold text-foreground">Team Docs · Q4</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">11 tasks</span>
      </div>
      <div className="flex gap-2">
        {columns.map((col) => (
          <div key={col.title} className="flex-1 min-w-0">
            <div className="mb-1.5 flex items-center gap-1">
              <span className={`size-1.5 shrink-0 rounded-full ${col.dot}`} />
              <p className={`text-[9px] font-semibold uppercase tracking-wide ${col.color}`}>
                {col.title}
              </p>
            </div>
            <div className="space-y-1">
              {col.items.map((item) => (
                <div key={item} className="rounded-md border border-border bg-background px-2 py-1.5 text-[10px] leading-tight text-foreground shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FormatPickerVisual() {
  const formats = [
    { label: "Article", active: false },
    { label: "Comparison", active: true },
    { label: "Outline", active: false },
    { label: "Slides", active: false },
    { label: "FAQ", active: false },
  ]

  return (
    <div className="w-full max-w-xs overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="border-b border-border px-4 py-2.5">
        <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Your query</p>
        <p className="mt-0.5 text-[11px] text-foreground leading-snug">
          Compare the top JavaScript frameworks for a startup in 2024
        </p>
      </div>
      <div className="px-4 py-3">
        <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          AI selected format
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {formats.map((f) => (
            <span
              key={f.label}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                f.active
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              {f.label}
            </span>
          ))}
        </div>
        <div className="mt-3 space-y-1">
          <div className="grid grid-cols-4 gap-1.5">
            {["React", "Vue", "Svelte", "Angular"].map((h) => (
              <div key={h} className="rounded bg-primary/8 px-1.5 py-1 text-center text-[9px] font-semibold text-primary">{h}</div>
            ))}
          </div>
          {[["★★★★★", "★★★★☆", "★★★☆☆", "★★★★☆"], ["Large", "Medium", "Small", "Large"]].map((row, i) => (
            <div key={i} className="grid grid-cols-4 gap-1.5">
              {row.map((cell, j) => (
                <div key={j} className="rounded bg-muted/50 px-1.5 py-1 text-center text-[9px] text-muted-foreground">{cell}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const USE_CASES = [
  {
    audience: "Students",
    headline: "Turn any material into a study system",
    description:
      "Generate flashcard decks, quizzes, and study guides from your notes, then track progress as you review.",
    visual: <QuizVisual />,
    span: "lg:col-span-2",
  },
  {
    audience: "Researchers",
    headline: "Capture and connect ideas",
    description:
      "Map complex topics visually, compare sources in structured tables, and keep findings organized across projects.",
    visual: <MindMapVisual />,
    span: "lg:col-span-1",
  },
  {
    audience: "Teams",
    headline: "Shared knowledge that sticks",
    description:
      "Generate process docs and onboarding material that stays structured, not buried in a chat thread.",
    visual: <KanbanVisual />,
    span: "lg:col-span-1",
  },
  {
    audience: "Writers & Creators",
    headline: "Draft in the shape of your idea",
    description:
      "The AI picks the format that fits your intent (comparison table, outline, FAQ) and you refine from there.",
    visual: <FormatPickerVisual />,
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
            Same platform, different workflows. Tarteeb adapts to what you need.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc) => (
            <div
              key={uc.audience}
              className={`overflow-hidden rounded-2xl border border-border bg-background ${uc.span}`}
            >
              <div className="flex items-center justify-center bg-muted/40 p-5">
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
