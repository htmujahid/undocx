"use client";

import { useState } from "react";
import { UploadIcon } from "~@/components/ui/icons";
import { Toggle } from "~@/components/ui/toggle";
import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";

const samples = ["Proposal, Fenwick Gallery (2025)", "Studio newsletter, March", "Case study, Oakdene Garden Centre"];

const byCount = [
  "In today's fast-paced digital landscape, Marlow & Finch requires a robust, user-centric e-commerce solution that leverages modern best practices to deliver a seamless experience and drive sustainable growth.",
  "Marlow & Finch needs an online store that is easier to use. Customers should be able to find a book and pay for it without friction, and the site should reflect the shop's character.",
  "Your customers know what they want to read. The website should make it easy to find the book and pay, and it should feel like the shop rather than a generic store.",
  "Your customers already know what they want to read. The website should get out of their way: find the book, pay, done. Everything in this proposal serves that one sentence.",
];

const genericWords = new Set(["fast-paced", "robust,", "user-centric", "leverages", "seamless", "sustainable"]);

export function VoicePlayground() {
  const [on, setOn] = useState<boolean[]>([true, true, true]);
  const count = on.filter(Boolean).length;
  const text = byCount[count];

  return (
    <Sheet>
      <SheetChrome title="Summary · opening">
        <span>{count === 0 ? "No samples" : `${count} ${count === 1 ? "sample" : "samples"} on`}</span>
      </SheetChrome>
      <SheetPage>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
          <div>
            <p className="m-0 mb-2 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Writing samples</p>
            <ul className="m-0 grid list-none gap-2 p-0">
              {samples.map((sample, index) => (
                <li key={sample}>
                  <Toggle
                    pressed={on[index]}
                    onPressedChange={(pressed) => setOn((current) => current.map((value, i) => (i === index ? pressed : value)))}
                    className="h-auto w-full justify-start py-2 text-left"
                  >
                    <UploadIcon className="size-3.5 shrink-0" />
                    <span className="min-w-0 truncate">{sample}</span>
                  </Toggle>
                </li>
              ))}
            </ul>
            <p className="m-0 mt-3 text-sm text-muted-foreground">Turn them off one at a time.</p>
          </div>
          <div className="border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <p className="m-0 mb-1 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">The same brief, drafted</p>
            <p key={count} className="m-0 max-w-measure text-base leading-relaxed animate-fade-in motion-reduce:animate-none" aria-live="polite">
              {count === 0
                ? text.split(" ").map((word, index) => (
                    <span key={index}>
                      {genericWords.has(word) ? <span className="underline decoration-input decoration-wavy underline-offset-[0.2em]">{word}</span> : word}{" "}
                    </span>
                  ))
                : text}
            </p>
          </div>
        </div>
      </SheetPage>
    </Sheet>
  );
}
