"use client";

import { useState } from "react";
import { SegmentedControl, SegmentedControlItem } from "~@/components/ui/segmented-control";
import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";

type Tone = "direct" | "warm" | "formal";
type Length = "2" | "4" | "8";

const openings: Record<Tone, string> = {
  direct: "Marlow & Finch loses a third of its online customers at the checkout. This proposal fixes that in twelve weeks for £18,400.",
  warm: "Marlow & Finch has been selling books on Bridge Street since 1987. The website should feel as easy to buy from as the shop does, and this proposal sets out how to get there.",
  formal: "This proposal describes a twelve-week programme to rebuild the Marlow & Finch online store, with a fixed price of £18,400 and three review points.",
};

const sections = ["Summary", "What we heard", "Scope of work", "Timeline", "Investment", "Next steps"];
const shares = [0.1, 0.25, 0.3, 0.1, 0.1, 0.15];

export function BriefPlayground() {
  const [tone, setTone] = useState<Tone>("direct");
  const [length, setLength] = useState<Length>("4");
  const words = Number(length) * 300;

  return (
    <Sheet>
      <SheetChrome title="Untitled proposal">
        <span>Brief</span>
      </SheetChrome>
      <SheetPage>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <dl className="m-0 grid gap-y-4">
            <div>
              <dt className="m-0 font-serif text-base text-muted-foreground italic">Who will read this?</dt>
              <dd className="m-0 text-base">Ruth Marlow, the owner, and her bookkeeper.</dd>
            </div>
            <div>
              <dt className="m-0 font-serif text-base text-muted-foreground italic">What should it achieve?</dt>
              <dd className="m-0 text-base">A yes to a twelve-week rebuild.</dd>
            </div>
            <div>
              <dt className="m-0 mb-1.5 font-serif text-base text-muted-foreground italic">Tone?</dt>
              <dd className="m-0">
                <SegmentedControl aria-label="Tone" value={tone} onValueChange={(v) => v && setTone(v as Tone)}>
                  <SegmentedControlItem value="direct">Direct</SegmentedControlItem>
                  <SegmentedControlItem value="warm">Warm</SegmentedControlItem>
                  <SegmentedControlItem value="formal">Formal</SegmentedControlItem>
                </SegmentedControl>
              </dd>
            </div>
            <div>
              <dt className="m-0 mb-1.5 font-serif text-base text-muted-foreground italic">Length?</dt>
              <dd className="m-0">
                <SegmentedControl aria-label="Length in pages" value={length} onValueChange={(v) => v && setLength(v as Length)}>
                  <SegmentedControlItem value="2">2 pages</SegmentedControlItem>
                  <SegmentedControlItem value="4">4 pages</SegmentedControlItem>
                  <SegmentedControlItem value="8">8 pages</SegmentedControlItem>
                </SegmentedControl>
              </dd>
            </div>
          </dl>
          <div className="grid gap-6 border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <div>
              <p className="m-0 mb-1 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Opening, as the brief stands</p>
              <p key={tone} className="m-0 max-w-measure text-base leading-relaxed animate-fade-in motion-reduce:animate-none" aria-live="polite">
                {openings[tone]}
              </p>
            </div>
            <div>
              <p className="m-0 mb-2 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Section budget · about {words.toLocaleString()} words
              </p>
              <ul className="m-0 grid list-none gap-y-1.5 p-0 text-sm">
                {sections.map((section, index) => {
                  const count = Math.round((words * shares[index]) / 10) * 10;
                  return (
                    <li key={section} className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)_3.5rem] items-center gap-x-3">
                      <span className="truncate text-foreground">{section}</span>
                      <span className="h-1.5 rounded-sm bg-muted">
                        <span className="block h-full rounded-sm bg-primary/70 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${shares[index] * 100}%` }} />
                      </span>
                      <span className="text-right tabular-nums text-muted-foreground">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </SheetPage>
    </Sheet>
  );
}
