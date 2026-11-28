"use client";

import Link from "next/link";
import { type ChatSource } from "~@/lib/chat/schemas";

export function SourceList({ sources, text }: { sources: ChatSource[]; text: string }) {
  const cited = sources.filter((source) => text.includes(`[${source.n}]`));
  if (cited.length === 0) return null;
  return (
    <ol className="m-0 grid list-none gap-2 p-0">
      {cited.map((source) => (
        <li key={source.n} className="grid gap-1 rounded-md border border-border bg-background p-3">
          <Link href={`/documents/${source.documentId}`} className="flex items-baseline gap-2 text-xs font-medium text-foreground no-underline hover:underline">
            <span className="font-mono text-primary">[{source.n}]</span>
            <span className="truncate">{source.title}</span>
            {source.section ? <span className="truncate font-normal text-muted-foreground">{source.section}</span> : null}
          </Link>
          <p className="m-0 line-clamp-3 text-xs leading-normal text-muted-foreground">{source.text}</p>
        </li>
      ))}
    </ol>
  );
}
