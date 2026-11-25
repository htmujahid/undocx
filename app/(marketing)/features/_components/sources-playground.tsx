"use client";

import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { FileTextIcon, Link2Icon } from "~@/components/ui/icons";
import { cn } from "~@/lib/utils";
import { SectionLabel, Sheet, SheetChrome, SheetPage } from "../../_components/doc";

const title = "Proposal: a new online store for Marlow & Finch";

const text = [
  { kind: "text", text: "Last year the website took 2,614 orders, 41% of the total" },
  { kind: "cite", number: 1 },
  { kind: "text", text: ". The average basket was £27.80, and 34% of started checkouts were abandoned" },
  { kind: "cite", number: 2 },
  { kind: "text", text: ", most of them at the account-creation step" },
  { kind: "cite", number: 2 },
  { kind: "text", text: ". Staff estimate that one in five phone orders is a customer who gave up online" },
  { kind: "cite", number: 3 },
  { kind: "text", text: "." },
] as const;

const sources = [
  { number: 1, title: "Sales export 2025.xlsx", url: undefined as string | undefined },
  { number: 2, title: "Shopify analytics, Jan to Dec 2025", url: "#" as string | undefined },
  { number: 3, title: "Staff interview notes.docx", url: undefined as string | undefined },
];

const excerpts: Record<number, string> = {
  1: "Row 9: Online · 2,614 orders · £72,669 · 41% of total",
  2: "Checkout funnel · Jan–Dec 2025 · Started 7,702 · Account step 5,060 · Paid 5,083 (34% abandoned)",
  3: "Priya, Saturday till: “Maybe one in five phone orders starts with ‘I tried the website and gave up.’”",
};

export function SourcesPlayground() {
  const [open, setOpen] = useState<number | null>(1);
  const [removed, setRemoved] = useState<Set<number>>(new Set());

  function toggleRemoved(number: number) {
    setRemoved((current) => {
      const next = new Set(current);
      if (next.has(number)) next.delete(number);
      else next.add(number);
      return next;
    });
  }

  const orphaned = text.filter((part) => part.kind === "cite" && removed.has(part.number)).length;

  return (
    <Sheet>
      <SheetChrome title={title}>
        <span>{3 - removed.size} of 3 sources attached</span>
      </SheetChrome>
      <SheetPage>
        <SectionLabel number="2">What we heard</SectionLabel>
        <p className="m-0 max-w-measure">
          {text.map((part, index) =>
            part.kind === "cite" ? (
              <sup key={index} className="ml-0.5 align-super text-[0.65em] leading-none">
                <button
                  type="button"
                  aria-pressed={open === part.number}
                  aria-label={removed.has(part.number) ? `Source ${part.number}, removed` : `Source ${part.number}`}
                  onClick={() => setOpen(open === part.number ? null : part.number)}
                  className={cn(
                    "inline-flex size-[1.5em] items-center justify-center rounded-sm font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                    removed.has(part.number) ? "bg-primary text-primary-foreground" : open === part.number ? "bg-primary/25 text-primary-deep" : "bg-primary/10 text-primary hover:bg-primary/20",
                  )}
                >
                  {removed.has(part.number) ? "!" : part.number}
                </button>
              </sup>
            ) : (
              <span key={index}>{part.text}</span>
            ),
          )}
        </p>
        {orphaned > 0 ? (
          <p role="status" className="m-0 mt-3 text-sm font-medium text-primary">
            {orphaned} {orphaned === 1 ? "claim has" : "claims have"} lost {orphaned === 1 ? "its" : "their"} source. Attach another, cut, or mark as an estimate.
          </p>
        ) : null}
        <ol aria-label="Sources" className="m-0 mt-5 grid max-w-measure list-none gap-y-0 border-t border-border p-0 pt-2 text-sm">
          {sources.map((source) => {
            const isOpen = open === source.number;
            const isRemoved = removed.has(source.number);
            return (
              <li key={source.number} className="border-b border-border py-2.5">
                <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-x-2">
                  <span className="font-medium tabular-nums text-primary">{source.number}</span>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : source.number)}
                    aria-expanded={isOpen}
                    className={cn("inline-flex items-center gap-1 text-left font-medium text-foreground underline-offset-[0.2em] hover:underline", isRemoved && "line-through text-muted-foreground")}
                  >
                    {source.url ? <Link2Icon className="size-3" /> : <FileTextIcon className="size-3" />}
                    {source.title}
                  </button>
                  <Button size="sm" variant="ghost" onClick={() => toggleRemoved(source.number)}>
                    {isRemoved ? "Restore" : "Remove"}
                  </Button>
                </div>
                {isOpen ? (
                  <p className="m-0 mt-2 ml-8 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed text-muted-foreground">
                    {excerpts[source.number]}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </SheetPage>
    </Sheet>
  );
}
