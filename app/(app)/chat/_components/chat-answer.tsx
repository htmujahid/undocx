"use client";

import Link from "next/link";
import { Fragment } from "react";
import { type ChatSource } from "~@/lib/chat/schemas";

export function Answer({ text, sources }: { text: string; sources: ChatSource[] }) {
  const parts = text.replace(/\*\*|__/g, "").split(/(\[\d+\])/g);
  return (
    <p className="m-0 whitespace-pre-wrap text-foreground">
      {parts.map((part, index) => {
        const match = /^\[(\d+)\]$/.exec(part);
        const source = match ? sources.find((item) => item.n === Number(match[1])) : undefined;
        if (!source) return <Fragment key={index}>{part}</Fragment>;
        return (
          <Link key={index} href={`/documents/${source.documentId}`} aria-label={`Source ${source.n}: ${source.title}`} className="mx-0.5 align-super text-[0.65rem] font-medium text-primary no-underline hover:underline">
            [{source.n}]
          </Link>
        );
      })}
    </p>
  );
}
