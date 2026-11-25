"use client";

import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { CheckIcon } from "~@/components/ui/icons";
import { cn } from "~@/lib/utils";
import { Instruction, SectionLabel, Sheet, SheetChrome, SheetPage, paragraphClass } from "../../_components/doc";

const variants = [
  { label: "A", text: "We propose to rebuild the Marlow & Finch online store so that buying a book online feels like buying one over the counter." },
  { label: "B", text: "This proposal covers a twelve-week rebuild of the Marlow & Finch online store: a shorter checkout, a catalogue built around search, and emails that sound like the shop." },
  { label: "C", text: "The shop on Bridge Street is easy to buy from. The website is not. This proposal closes that gap in twelve weeks." },
];

const merged = "The shop on Bridge Street is easy to buy from. The website is not. This proposal closes that gap in twelve weeks: a shorter checkout, a catalogue built around search, and emails that sound like the shop.";

export function VariationsPlayground() {
  const [chosen, setChosen] = useState("A");
  const [isMerged, setIsMerged] = useState(false);

  return (
    <Sheet>
      <SheetChrome title="Proposal: a new online store for Marlow & Finch">
        <span>Draft · 1 of 6</span>
      </SheetChrome>
      <SheetPage>
        <SectionLabel number="1">Summary · opening sentence</SectionLabel>
        <p className="m-0 mb-2 max-w-measure text-muted-foreground">We propose to rebuild the Marlow & Finch online store so that it is as easy to buy from as the shop itself.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {variants.map((variant) => {
            const isChosen = !isMerged && chosen === variant.label;
            return (
              <div key={variant.label} className={cn("flex flex-col gap-3 rounded-md border border-border p-4 text-base leading-[1.55] transition-[border-color,box-shadow] duration-150", isChosen && "border-primary shadow-[inset_0_0_0_1px_var(--primary)]")}>
                <span className={cn("flex items-center justify-between font-serif text-lg text-muted-foreground", isChosen && "text-primary")}>
                  <span>{variant.label}</span>
                  {isChosen ? <CheckIcon aria-label="Chosen" className="size-4" /> : null}
                </span>
                <p className="m-0 grow">{variant.text}</p>
                <div>
                  <Button
                    size="sm"
                    variant={isChosen ? "primary" : "secondary"}
                    aria-pressed={isChosen}
                    onClick={() => {
                      setChosen(variant.label);
                      setIsMerged(false);
                    }}
                  >
                    {isChosen ? "Chosen" : "Use this"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 max-w-measure">
          {isMerged ? (
            <>
              <Instruction label="Merged">C&rsquo;s opening, then B&rsquo;s list</Instruction>
              <p className={paragraphClass}>{merged}</p>
            </>
          ) : (
            <Button size="sm" onClick={() => setIsMerged(true)}>
              Merge B and C
            </Button>
          )}
        </div>
      </SheetPage>
    </Sheet>
  );
}
