"use client"

function ContentBlocksVisual() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
        <span className="text-xs font-medium text-muted-foreground">
          Quarterly revenue review
        </span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          Generated
        </span>
      </div>

      <div className="space-y-3 p-5">
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3 text-primary"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
              Note
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-foreground/80">
            Growth accelerated in Q3, driven by enterprise renewals.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-3 bg-muted/50 text-[10px] font-semibold text-muted-foreground">
            {["Quarter", "Revenue", "Δ"].map((h) => (
              <span key={h} className="px-2.5 py-1.5">
                {h}
              </span>
            ))}
          </div>
          {[
            ["Q1", "$1.2M", "+8%"],
            ["Q2", "$1.4M", "+17%"],
            ["Q3", "$1.9M", "+36%"],
          ].map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 border-t border-border text-[10px] text-foreground/80"
            >
              {row.map((cell, j) => (
                <span
                  key={j}
                  className={`px-2.5 py-1.5 ${j === 2 ? "font-medium text-primary" : ""}`}
                >
                  {cell}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border px-3 pb-2 pt-3">
          <svg viewBox="0 0 200 56" className="w-full">
            {[
              { x: 12, h: 20 },
              { x: 52, h: 26 },
              { x: 92, h: 30 },
              { x: 132, h: 38 },
              { x: 172, h: 48 },
            ].map((bar, i) => (
              <rect
                key={i}
                x={bar.x}
                y={52 - bar.h}
                width={22}
                height={bar.h}
                rx={2}
                fill="oklch(0.457 0.24 277.023)"
                opacity={0.35 + i * 0.13}
              />
            ))}
            <line
              x1="6"
              y1="52"
              x2="194"
              y2="52"
              stroke="currentColor"
              strokeOpacity="0.15"
            />
          </svg>
        </div>

        <div className="rounded-lg bg-muted/60 px-3 py-2 font-mono text-[10px] text-foreground/70">
          <span className="text-primary">SELECT</span> sum(amount){" "}
          <span className="text-primary">FROM</span> revenue;
        </div>
      </div>
    </div>
  )
}

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

  const collections = [
    { label: "Reading list", color: "bg-blue-500" },
    { label: "Drafts", color: "bg-amber-500" },
    { label: "Shared", color: "bg-emerald-500" },
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
          Jump to anything...
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
              (item as { active?: boolean }).active
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
                className="size-3 shrink-0 opacity-60"
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
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Collections
        </p>
        <div className="flex flex-wrap gap-1.5">
          {collections.map((c) => (
            <span
              key={c.label}
              className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-foreground/80"
            >
              <span className={`size-1.5 rounded-full ${c.color}`} />
              {c.label}
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

          <div className="absolute -top-2 left-0 w-64 translate-y-[-100%] overflow-hidden rounded-xl border border-border bg-background shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3 shrink-0 text-primary"
              >
                <path d="M5 3v4M3 5h4M6 17v4M4 19h4" />
                <path d="m13 3 3.5 7L23 13.5 16.5 17 13 24 9.5 17 3 13.5 9.5 10z" />
              </svg>
              <span className="text-[11px] text-foreground/80">
                Make this more concise and add a stat
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[10px] text-muted-foreground">
                Selection · 1 paragraph
              </span>
              <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
                Rewrite
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
          <div className="h-2 w-5/6 rounded-full bg-emerald-500/30" />
          <div className="mt-1.5 h-2 w-2/3 rounded-full bg-emerald-500/20" />
          <div className="mt-2.5 flex gap-1.5">
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white">
              Accept
            </span>
            <span className="rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Reject
            </span>
          </div>
        </div>

        <div className="h-2.5 w-5/6 rounded-full bg-muted/70" />
        <div className="h-2.5 w-2/3 rounded-full bg-muted/70" />
      </div>
    </div>
  )
}

function ChatVisual() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
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
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
        <span className="text-xs font-medium text-muted-foreground">
          Ask your knowledge base
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-[11px] leading-snug text-primary-foreground">
            How did revenue trend last quarter?
          </div>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[88%] space-y-2.5">
            <div className="rounded-2xl rounded-bl-sm border border-border bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-foreground/85">
              Revenue grew 36% in Q3 to $1.9M
              <sup className="ml-0.5 rounded bg-primary/15 px-1 text-[8px] font-semibold text-primary">
                1
              </sup>
              , driven mostly by enterprise renewals
              <sup className="ml-0.5 rounded bg-primary/15 px-1 text-[8px] font-semibold text-primary">
                2
              </sup>
              .
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                Sources
              </p>
              {["Quarterly revenue review", "Enterprise renewals memo"].map(
                (s, i) => (
                  <div
                    key={s}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[10px] text-foreground/70"
                  >
                    <span className="flex size-3.5 shrink-0 items-center justify-center rounded bg-primary/15 text-[8px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    {s}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
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
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: "Structured by default",
    description:
      "Undocx doesn't return a wall of text. It composes each document from the blocks that fit the topic (tables for comparisons, syntax-highlighted code, SVG diagrams and charts, callouts, math, and footnoted citations) so the answer is usable the moment it lands.",
    visual: <ContentBlocksVisual />,
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
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      </svg>
    ),
    title: "A knowledge base, not a chat log",
    description:
      "Everything you generate is saved as a document you own. Sort it into nested folders and color-coded collections, star what matters, archive what doesn't, and jump to anything instantly with the ⌘K command palette.",
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
    title: "Edit with AI, line by line",
    description:
      "Select any part of a document (a sentence, a table row, a paragraph) and tell the AI what to change in plain language. It rewrites just that range and shows the proposed change inline, so you can accept or reject before anything is saved. You can also point it at other documents for context.",
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
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    ),
    title: "Chat with your documents",
    description:
      "Ask a question and get an answer grounded in your own knowledge base. Undocx searches across your documents semantically and replies with inline citations, so you can always trace a claim back to its source.",
    visual: <ChatVisual />,
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
