"use client";

import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon, XIcon } from "~@/components/ui/icons";
import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";

type Item = { number: string; title: string; note: string; weight: number };

const initial: Item[] = [
  { number: "1", title: "Summary", note: "The yes we are asking for, in six lines.", weight: 1 },
  { number: "2", title: "What we heard", note: "Three visits, two staff interviews, one afternoon on the till.", weight: 2.5 },
  { number: "3", title: "Scope of work", note: "Checkout, catalogue, order emails. What is out.", weight: 3 },
  { number: "4", title: "Timeline", note: "Twelve weeks, three checkpoints.", weight: 1 },
  { number: "5", title: "Investment", note: "One fixed price, two payments.", weight: 1 },
  { number: "6", title: "Next steps", note: "What happens when Ruth signs.", weight: 1.5 },
];
const optional: Item = { number: "7", title: "Risks", note: "What could slip, and what we do if it does.", weight: 1 };
const totalWords = 1200;

export function OutlinePlayground() {
  const [items, setItems] = useState<Item[]>(initial);
  const hasRisks = items.some((item) => item.number === optional.number);
  const totalWeight = items.reduce((n, item) => n + item.weight, 0);

  function move(number: string, delta: -1 | 1) {
    setItems((current) => {
      const from = current.findIndex((item) => item.number === number);
      const to = from + delta;
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  return (
    <Sheet>
      <SheetChrome title="Marlow & Finch proposal">
        <span>Outline · {items.length} sections · {totalWords.toLocaleString()} words</span>
      </SheetChrome>
      <SheetPage>
        <ol className="m-0 list-none p-0">
          {items.map((item, position) => {
            const words = Math.round((totalWords * item.weight) / totalWeight / 10) * 10;
            return (
              <li key={item.number} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-border py-2.5">
                <span className="font-serif text-lg tabular-nums text-primary">{position + 1}</span>
                <span className="min-w-0">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-serif text-lg leading-snug font-medium text-foreground">{item.title}</span>
                    <span className="text-sm tabular-nums text-muted-foreground">{words} words</span>
                  </span>
                  <span className="mt-1 block h-1 rounded-sm bg-muted">
                    <span className="block h-full rounded-sm bg-primary/70 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${(item.weight / totalWeight) * 100}%` }} />
                  </span>
                </span>
                <span className="flex gap-0.5">
                  <Button variant="ghost" size="icon" aria-label={`Move ${item.title} up`} disabled={position === 0} onClick={() => move(item.number, -1)}>
                    <ArrowUpIcon />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Move ${item.title} down`} disabled={position === items.length - 1} onClick={() => move(item.number, 1)}>
                    <ArrowDownIcon />
                  </Button>
                  {item.number === optional.number ? (
                    <Button variant="ghost" size="icon" aria-label="Remove Risks" onClick={() => setItems((current) => current.filter((i) => i.number !== optional.number))}>
                      <XIcon />
                    </Button>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm" disabled={hasRisks} onClick={() => setItems((current) => [...current.slice(0, 4), optional, ...current.slice(4)])}>
            Add a Risks section
          </Button>
          <span className="text-sm text-muted-foreground">The other sections give up words to make room.</span>
        </div>
      </SheetPage>
    </Sheet>
  );
}
