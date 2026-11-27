"use client";

import { useState } from "react";
import { SegmentedControl, SegmentedControlItem } from "~@/components/ui/segmented-control";
import { cn } from "~@/lib/utils";
import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";

const profiles = {
  studio: {
    name: "Studio, web design",
    holds: [
      ["Who you are", "A three-person web studio in Leeds."],
      ["Who you write for", "Small shops and galleries. Not technical."],
      ["Facts to rely on", "Fixed prices. Twelve-week builds. Payment in two halves."],
    ],
    skips: "Who will read this?",
  },
  consultant: {
    name: "Independent consultant",
    holds: [
      ["Who you are", "A retail operations consultant, ten years in."],
      ["Who you write for", "Directors and boards. Short on time."],
      ["Facts to rely on", "Day rate. Findings first, method second."],
    ],
    skips: "Who will read this?",
  },
} as const;

type Id = keyof typeof profiles;

const others = [
  ["Voice", "How it sounds", "Learned from three to ten things you wrote. Sentence length, openings, vocabulary."],
  ["Rules", "What must always or never happen", "British spelling, banned words, how prices are written. Checked, not guessed."],
];

export function WriterProfilePlayground() {
  const [id, setId] = useState<Id>("studio");
  const profile = profiles[id];

  return (
    <Sheet>
      <SheetChrome title="New document">
        <SegmentedControl aria-label="Writer profile" value={id} onValueChange={(value) => value && setId(value as Id)}>
          <SegmentedControlItem value="studio">Studio</SegmentedControlItem>
          <SegmentedControlItem value="consultant">Consultant</SegmentedControlItem>
        </SegmentedControl>
      </SheetChrome>
      <SheetPage>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div>
            <p className="m-0 mb-1 font-mono text-[0.65rem] tracking-[0.15em] text-primary uppercase">Writer profile · who and what</p>
            <h3 className="m-0 mb-3 font-serif text-2xl font-medium text-foreground">{profile.name}</h3>
            <dl key={id} className="m-0 grid gap-y-3 animate-fade-in motion-reduce:animate-none">
              {profile.holds.map(([term, text]) => (
                <div key={term}>
                  <dt className="m-0 font-serif text-base text-muted-foreground italic">{term}</dt>
                  <dd className="m-0 text-base text-foreground">{text}</dd>
                </div>
              ))}
            </dl>
            <p className="m-0 mt-4 border-l-2 border-primary/40 pl-3 text-sm leading-normal text-muted-foreground">
              With this profile picked, Undocx does not ask <span className="font-serif text-foreground italic">“{profile.skips}”</span>
            </p>
          </div>
          <ul className="m-0 grid list-none gap-4 border-t border-border p-0 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            {others.map(([name, what, text], index) => (
              <li key={name} className={cn("grid gap-1", index === 0 && "")}>
                <p className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
                  {name} · {what}
                </p>
                <p className="m-0 text-sm leading-normal text-muted-foreground">{text}</p>
              </li>
            ))}
            <li className="text-sm leading-normal text-foreground">Three separate picks. Mix a voice from one place with rules from another.</li>
          </ul>
        </div>
      </SheetPage>
    </Sheet>
  );
}
