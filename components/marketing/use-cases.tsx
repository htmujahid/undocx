"use client"

function NotesVisual() {
  return (
    <div className="w-full max-w-xs overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-[11px] font-medium text-muted-foreground">
          Photosynthesis · Notes
        </span>
        <span className="text-[10px] text-muted-foreground">Markdown</span>
      </div>
      <div className="space-y-2.5 px-4 py-3">
        <p className="text-xs font-semibold leading-snug">
          Light-dependent reactions
        </p>
        <div className="space-y-1">
          {[
            "Occur in the thylakoid membrane",
            "Convert light energy to ATP & NADPH",
            "Release O₂ as a by-product",
          ].map((line) => (
            <div
              key={line}
              className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground"
            >
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
              {line}
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-2.5 py-1.5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-600">
            Tip
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-foreground/75">
            Remember: light reactions need light; the Calvin cycle does not.
          </p>
        </div>
      </div>
    </div>
  )
}

function CitationsVisual() {
  return (
    <div className="w-full max-w-xs space-y-2.5">
      <div className="flex justify-end">
        <div className="rounded-2xl rounded-br-sm bg-primary px-3 py-1.5 text-[11px] text-primary-foreground">
          What did the 2023 sources conclude?
        </div>
      </div>
      <div className="rounded-2xl rounded-bl-sm border border-border bg-background px-3 py-2 text-[11px] leading-relaxed text-foreground/85 shadow-sm">
        Adoption rose sharply
        <sup className="ml-0.5 rounded bg-primary/15 px-1 text-[8px] font-semibold text-primary">
          1
        </sup>
        , though costs remained a barrier
        <sup className="ml-0.5 rounded bg-primary/15 px-1 text-[8px] font-semibold text-primary">
          2
        </sup>
        .
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["Market report '23", "Cost analysis"].map((s, i) => (
          <span
            key={s}
            className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[9px] text-muted-foreground"
          >
            <span className="flex size-3 items-center justify-center rounded bg-primary/15 text-[7px] font-semibold text-primary">
              {i + 1}
            </span>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

function CodeVisual() {
  const lines = [
    [
      { t: "function", c: "text-primary" },
      { t: " sync(", c: "" },
      { t: "data", c: "text-amber-600" },
      { t: ") {", c: "" },
    ],
    [
      { t: "  return", c: "text-primary" },
      { t: " data.", c: "" },
      { t: "map", c: "text-emerald-600" },
      { t: "(embed)", c: "" },
    ],
    [{ t: "}", c: "" }],
  ]

  return (
    <div className="w-full max-w-xs overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-3 py-2">
        <div className="size-2 rounded-full bg-border" />
        <div className="size-2 rounded-full bg-border" />
        <div className="size-2 rounded-full bg-border" />
        <span className="ml-1.5 text-[10px] text-muted-foreground">
          embeddings.ts
        </span>
      </div>
      <div className="space-y-1 px-3 py-3 font-mono text-[10px]">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="select-none text-muted-foreground/40">
              {i + 1}
            </span>
            <span className="text-foreground/80">
              {line.map((tok, j) => (
                <span key={j} className={tok.c}>
                  {tok.t}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CollaborationVisual() {
  const members = [
    { name: "Ava Chen", role: "Owner", tone: "bg-primary/10 text-primary" },
    {
      name: "Liam Patel",
      role: "Editor",
      tone: "bg-muted text-muted-foreground",
    },
    {
      name: "Noor Khan",
      role: "Viewer",
      tone: "bg-muted text-muted-foreground",
    },
  ]

  return (
    <div className="w-full max-w-xs overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="border-b border-border px-4 py-2">
        <span className="text-[11px] font-medium text-muted-foreground">
          Share · Product wiki
        </span>
      </div>
      <div className="space-y-1.5 px-4 py-3">
        {members.map((m) => (
          <div key={m.name} className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
              {m.name[0]}
            </span>
            <span className="text-[11px] text-foreground/80">{m.name}</span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-medium ${m.tone}`}
            >
              {m.role}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-4 py-2.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3 text-muted-foreground"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span className="text-[10px] text-muted-foreground">
          Public link · anyone can view
        </span>
        <span className="ml-auto rounded-md bg-primary px-2 py-0.5 text-[9px] font-medium text-primary-foreground">
          Copy
        </span>
      </div>
    </div>
  )
}

const USE_CASES = [
  {
    audience: "Students & learners",
    headline: "Turn dense material into clear notes",
    description:
      "Ask for an explanation and get structured notes (headings, lists, callouts, and diagrams) saved and searchable for when you study again.",
    visual: <NotesVisual />,
    span: "lg:col-span-2",
  },
  {
    audience: "Researchers & analysts",
    headline: "Ask across everything you've saved",
    description:
      "Chat with your own documents and get answers with inline citations, so every claim traces back to a source you can trust.",
    visual: <CitationsVisual />,
    span: "lg:col-span-1",
  },
  {
    audience: "Engineers",
    headline: "Docs with real code and diagrams",
    description:
      "Generate technical write-ups with syntax-highlighted code, tables, and SVG diagrams, not vague prose you have to rebuild.",
    visual: <CodeVisual />,
    span: "lg:col-span-1",
  },
  {
    audience: "Teams",
    headline: "One shared, organized knowledge base",
    description:
      "Invite teammates as editors or viewers, share a single document or a whole workspace, and publish read-only links anyone can open.",
    visual: <CollaborationVisual />,
    span: "lg:col-span-2",
  },
]

export function UseCases() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Use cases
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for how you actually work
          </h2>
          <p className="mt-4 text-muted-foreground">
            Same platform, different workflows. Undocx adapts to what you need.
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
                <h3 className="mt-1.5 text-base font-semibold">
                  {uc.headline}
                </h3>
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
