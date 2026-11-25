"use client";

import { useEffect, useRef, useState } from "react";
import { FocusIcon, LockIcon, UnfocusIcon } from "~@/components/ui/icons";
import { Toggle } from "~@/components/ui/toggle";
import { cn } from "~@/lib/utils";
import { Sheet, SheetChrome, paragraphClass } from "../../_components/doc";

const title = "Proposal: a new online store for Marlow & Finch";

const sections = [
  { n: "1", title: "Summary", isLocked: false, paragraphs: ["The shop on Bridge Street is easy to buy from. The website is not. This proposal closes that gap in twelve weeks: a shorter checkout, a catalogue built around search, and order emails that sound like the shop.", "The price is £18,400, fixed, in two payments. Work starts the week you sign and the new store goes live on 15 May."] },
  { n: "2", title: "What we heard", isLocked: true, paragraphs: ["Marlow & Finch has sold books on Bridge Street since 1987. Last year, 41% of orders came through the website, up from 12% in 2019, and the site has not changed since then.", "A customer who has found the right book still has six screens to get through before paying, and about one in three gives up on the way."] },
  { n: "3", title: "Scope of work", isLocked: false, paragraphs: ["Three pieces of work, in the order customers meet them. Each has a definition of done that Ruth can check without asking us.", "Out of scope, so there is no doubt later: stock management and the till, which stay as they are."] },
  { n: "4", title: "Timeline", isLocked: false, paragraphs: ["Twelve weeks from signature, with a checkpoint at the end of weeks four, eight and eleven. Each checkpoint is a working version you can click through, not a slide."] },
  { n: "5", title: "Investment", isLocked: true, paragraphs: ["The total is £18,400, fixed. Half is due on signing and half on launch. The price includes twelve weeks of work and a month of fixes after launch, and it will not change unless the scope does."] },
  { n: "6", title: "Next steps", isLocked: false, paragraphs: ["Sign the attached agreement. Send the product export and the logo files. Book the week-four checkpoint."] },
];

export function PagePlayground() {
  const [current, setCurrent] = useState("1");
  const [isFocus, setIsFocus] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const update = () => {
      const headings = Array.from(element.querySelectorAll<HTMLElement>("[data-section]"));
      const top = element.getBoundingClientRect().top + 48;
      let best = headings[0];
      for (const heading of headings) if (heading.getBoundingClientRect().top <= top) best = heading;
      setCurrent(best?.dataset.section ?? "1");
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    return () => element.removeEventListener("scroll", update);
  }, []);

  const jump = (n: string) => {
    const container = scroller.current;
    const element = container?.querySelector<HTMLElement>(`[data-section="${n}"]`);
    if (!element || !container) return;
    const top = element.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 24;
    container.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <Sheet>
      <SheetChrome title={title}>
        <Toggle pressed={isFocus} onPressedChange={setIsFocus} aria-label={isFocus ? "Leave focus mode" : "Focus mode"} className="h-8">
          {isFocus ? <UnfocusIcon /> : <FocusIcon />}
          {isFocus ? "Leave focus" : "Focus"}
        </Toggle>
      </SheetChrome>
      <div className={cn("grid grid-cols-1", !isFocus && "sm:grid-cols-[11rem_minmax(0,1fr)]")}>
        <nav aria-label="Outline" className={cn("border-b border-border bg-background p-3 sm:border-r sm:border-b-0", isFocus && "hidden")}>
          <h3 className="m-0 mb-1 px-2 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">Outline</h3>
          <ol className="m-0 grid list-none grid-cols-2 gap-x-2 p-0 sm:grid-cols-1">
            {sections.map((section) => {
              const isCurrent = current === section.n;
              return (
                <li key={section.n}>
                  <button
                    type="button"
                    onClick={() => jump(section.n)}
                    aria-current={isCurrent ? "location" : undefined}
                    className={cn("grid w-full grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-x-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring", isCurrent && "bg-card shadow-[inset_0_0_0_1px_var(--border)]")}
                  >
                    <span className="font-serif tabular-nums text-primary">{section.n}</span>
                    <span className="truncate">{section.title}</span>
                    {section.isLocked ? <LockIcon className="size-3 text-primary" aria-label="Contains locked text" /> : null}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <div ref={scroller} className="h-80 overflow-y-auto bg-muted/40 px-4 py-6 sm:px-8">
          <article className={cn("mx-auto rounded-sm border border-border bg-card px-6 py-8 sm:px-10", isFocus ? "max-w-measure" : "max-w-none")}>
            {sections.map((section) => (
              <section key={section.n} className="[&+section]:mt-10">
                <h2 data-section={section.n} className="m-0 mb-3 font-serif text-xl leading-tight font-medium tracking-tight text-foreground">
                  {section.n}. {section.title}
                </h2>
                {section.paragraphs.map((text) => (
                  <p key={text} className={paragraphClass}>
                    {text}
                  </p>
                ))}
              </section>
            ))}
          </article>
          <div aria-hidden="true" className="h-56" />
        </div>
      </div>
      <p className="m-0 flex h-9 items-center justify-between gap-4 border-t border-border px-4 text-xs text-muted-foreground">
        <span>{isFocus ? "Focus: just the page." : "Scroll the page. The outline follows."}</span>
        <span className="font-mono text-faint-foreground">Markdown</span>
      </p>
    </Sheet>
  );
}
