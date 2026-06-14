"use client"

export function ModeBadge({ mode }: { mode: "insert" | "replace" }) {
  if (mode === "insert") {
    return (
      <div className="border-b px-3 py-2">
        <div className="flex items-center gap-2 rounded-md bg-primary/6 px-2.5 py-1.5">
          <svg
            viewBox="0 0 8 8"
            className="size-2 shrink-0 fill-primary/70"
            aria-hidden="true"
          >
            <rect x="0" y="4.5" width="8" height="1.2" />
            <polygon points="4,0.5 7,4.5 1,4.5" />
          </svg>
          <span className="text-[10px] font-medium text-primary/80">
            Insert point set, content will be placed at the marker
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b px-3 py-2">
      <div className="flex items-center gap-2 rounded-md bg-primary/6 px-2.5 py-1.5">
        <svg
          viewBox="0 0 14 14"
          className="size-3 shrink-0 fill-primary/70"
          aria-hidden="true"
        >
          <rect x="0" y="5.5" width="14" height="1.5" />
          <rect x="0" y="7" width="14" height="1.5" />
          <polygon points="7,0 12,5 2,5" />
          <polygon points="7,14 12,9 2,9" />
        </svg>
        <span className="text-[10px] font-medium text-primary/80">
          Section selected, content between markers will be replaced
        </span>
      </div>
    </div>
  )
}
