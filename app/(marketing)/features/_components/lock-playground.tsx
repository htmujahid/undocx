"use client";

import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { CheckIcon, LockIcon, LockOpenIcon } from "~@/components/ui/icons";
import { Toggle } from "~@/components/ui/toggle";
import { cn } from "~@/lib/utils";
import { Instruction, SectionLabel, Sheet, SheetChrome, SheetPage, addedClass, paragraphClass, removedClass } from "../../_components/doc";

const title = "Proposal: a new online store for Marlow & Finch";

const paragraphs = [
  {
    id: "price",
    before: "The total is £18,400, fixed. Half is due on signing and half on launch. The price includes twelve weeks of work and a month of fixes after launch, and it will not change unless the scope does.",
    after: "The total is £18,400, fixed: half on signing, half on launch. It covers twelve weeks of work and a month of fixes.",
  },
  {
    id: "hosting",
    before: "Hosting is a separate, ongoing cost that is paid directly to the provider and is estimated at around £30 per month, which is similar to what the current site costs.",
    after: "Hosting stays separate: about £30 a month, paid to the provider, as now.",
  },
  {
    id: "later",
    before: "If Marlow & Finch would like to add further features in the future, these can be quoted separately as and when they are needed.",
    after: "Anything added later is quoted on its own.",
  },
];

export function LockPlayground() {
  const [locked, setLocked] = useState<Record<string, boolean>>({ price: true, hosting: false, later: false });
  const [hasRun, setHasRun] = useState(false);
  const lockedCount = Object.values(locked).filter(Boolean).length;

  return (
    <Sheet>
      <SheetChrome title={title}>
        <span>Draft · 5 of 6</span>
      </SheetChrome>
      <SheetPage>
        <SectionLabel number="5">Investment</SectionLabel>
        {paragraphs.map((paragraph) => {
          const isLocked = locked[paragraph.id];
          const isRewritten = hasRun && !isLocked;
          return (
            <div key={paragraph.id} className="mb-4 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <p className={cn(paragraphClass, "mb-0")}>
                  {isRewritten ? (
                    <>
                      <del className={removedClass}>{paragraph.before}</del> <ins className={addedClass}>{paragraph.after}</ins>
                    </>
                  ) : (
                    paragraph.before
                  )}
                </p>
              </div>
              <Toggle
                pressed={isLocked}
                aria-label={isLocked ? `Unlock paragraph` : `Lock paragraph`}
                onPressedChange={(pressed) => {
                  setLocked((current) => ({ ...current, [paragraph.id]: pressed }));
                  setHasRun(false);
                }}
                className={cn("sm:self-start", isLocked && "text-primary data-pressed:bg-primary/10")}
              >
                {isLocked ? <LockIcon /> : <LockOpenIcon />}
                {isLocked ? "Final" : "Lock"}
              </Toggle>
            </div>
          );
        })}
        <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          {hasRun ? (
            <>
              <Instruction label="Rewrote section with">Tighten this whole section.</Instruction>
            </>
          ) : (
            <Button size="sm" variant="primary" onClick={() => setHasRun(true)}>
              Tighten this whole section
            </Button>
          )}
          {hasRun ? (
            <p className="m-0 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckIcon className="size-3" />
              <span>
                {3 - lockedCount} rewritten. <span className="font-medium text-primary">{lockedCount} locked {lockedCount === 1 ? "passage" : "passages"} left as written.</span>
              </span>
            </p>
          ) : (
            <span className="text-sm text-muted-foreground">Lock or unlock any paragraph first.</span>
          )}
          {hasRun ? (
            <Button size="sm" variant="ghost" onClick={() => setHasRun(false)}>
              Reset
            </Button>
          ) : null}
        </div>
      </SheetPage>
    </Sheet>
  );
}
