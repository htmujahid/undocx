"use client";

export type BriefPick = { label: string; value: string };

export function Brief({ prompt, picks }: { prompt: string; picks: BriefPick[] }) {
  return (
    <div className="grid gap-2">
      <span className="text-xs text-muted-foreground">Your brief</span>
      <div className="rounded-md bg-foreground px-4 py-3 text-sm leading-normal whitespace-pre-wrap text-background">{prompt}</div>
      {picks.length > 0 ? (
        <ul aria-label="Your picks" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {picks.map((pick) => (
            <li key={pick.label} className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
              {pick.label}: <span className="text-foreground">{pick.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
