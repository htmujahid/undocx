"use client"

const ROWS = [
  {
    label: "Output",
    conventional: "Plain walls of text",
    undocx: "Tables, diagrams, code & math",
  },
  {
    label: "Organization",
    conventional: "No organization",
    undocx: "Folders, collections, favorites",
  },
  {
    label: "Editing",
    conventional: "Regenerate the whole reply",
    undocx: "Select a part, edit just that",
  },
  {
    label: "Q&A",
    conventional: "Forgets past chats",
    undocx: "Chat across your docs, with citations",
  },
  {
    label: "Collaboration",
    conventional: "Copy-paste into other tools",
    undocx: "Shared workspaces & public links",
  },
  {
    label: "History",
    conventional: "Ephemeral chat",
    undocx: "Persistent knowledge base",
  },
]

export function Comparison() {
  return (
    <section className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Why Undocx
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Not another chatbot
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built to organize and adapt, not just generate and forget.
          </p>
        </div>

        <div className="mt-16 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <div className="grid grid-cols-3 border-b border-border bg-muted/60 px-6 py-4">
            <span className="text-xs font-medium text-muted-foreground" />
            <span className="text-center text-xs font-medium text-muted-foreground">
              Conventional AI
            </span>
            <span className="text-center text-xs font-semibold text-foreground">
              Undocx
            </span>
          </div>

          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-3 items-center px-6 py-5 ${
                i < ROWS.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-sm font-medium">{row.label}</span>
              <span className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5 shrink-0 opacity-30"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                {row.conventional}
              </span>
              <span className="flex items-center justify-center gap-1.5 text-center text-xs font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5 shrink-0 text-primary"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {row.undocx}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
