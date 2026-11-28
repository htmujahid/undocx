"use client";

export function NoteQuote({ children }: { children: string | null }) {
  if (children === null) return null;
  return (
    <span className="line-clamp-2 border-l-2 border-primary/50 pl-2 text-sm text-muted-foreground italic">
      {children}
    </span>
  );
}
