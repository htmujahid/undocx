import type { ReactNode } from "react";
import { Caret, SectionLabel, Sheet, SheetChrome, SheetPage } from "../../_components/doc";
import { Section } from "../../_components/frame";
import { MoreLink } from "../../_components/more-link";

function Stage({ number, title, children, figure }: { number: string; title: string; children: ReactNode; figure: ReactNode }) {
  return (
    <li className="grid gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-8">
      <div>
        <span aria-hidden="true" className="block font-serif text-6xl leading-none text-primary">
          {number}
        </span>
        <h3 className="m-0 mt-2 font-serif text-2xl leading-tight font-medium">{title}</h3>
        <p className="m-0 mt-2 text-base leading-normal text-muted-foreground">{children}</p>
      </div>
      <div className="min-w-0">{figure}</div>
    </li>
  );
}

export function HowItWorks({ number }: { number: string }) {
  return (
    <Section
      id="how-it-works"
      number={number}
      label="How it works"
      note="Brief, outline, draft."
      title="One document, three stages. You approve each before the next."
      description={
        <>
          Nothing is written until the brief is answered and the outline is yours. <MoreLink href="/how-it-works">Each stage in detail</MoreLink>
        </>
      }
    >
      <ol className="m-0 grid list-none gap-10 p-0 [&>li+li]:border-t [&>li+li]:border-border [&>li+li]:pt-10">
        <Stage
          number="1"
          title="Brief"
          figure={
            <Sheet>
              <SheetChrome title="Untitled proposal">
                <span>Brief</span>
              </SheetChrome>
              <SheetPage>
                <dl className="m-0 grid gap-y-3">
                  {[
                    ["Who will read this?", "Ruth Marlow, the owner, and her bookkeeper. Neither is technical."],
                    ["What should it achieve?", "Get a yes to a three-month rebuild of the shop's checkout and catalogue."],
                    ["Tone?", "Direct and warm. Numbers first, no jargon."],
                    ["Length?", "Four pages. Ruth reads on paper."],
                  ].map(([q, a]) => (
                    <div key={q}>
                      <dt className="m-0 font-serif text-base text-muted-foreground italic">{q}</dt>
                      <dd className="m-0 text-base">{a}</dd>
                    </div>
                  ))}
                </dl>
              </SheetPage>
            </Sheet>
          }
        >
          Four questions: who reads it, what it must achieve, the tone, the length.
        </Stage>
        <Stage
          number="2"
          title="Outline"
          figure={
            <Sheet>
              <SheetChrome title="Marlow & Finch proposal">
                <span>Outline</span>
              </SheetChrome>
              <SheetPage>
                <ol className="m-0 list-none p-0">
                  {["Summary", "Scope of work", "What we heard", "Timeline", "Investment", "Next steps"].map((item, index) => (
                    <li key={item} className={"grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 border-b border-border py-1.5 text-base" + (index === 1 ? " -mx-2 rounded-sm bg-primary/10 px-2" : "")}>
                      <span className="font-serif tabular-nums text-primary">{index + 1}</span>
                      <span>
                        <span className="font-medium">{item}</span>
                        {index === 1 ? <span className="ml-2 text-sm text-primary">moved up</span> : null}
                      </span>
                    </li>
                  ))}
                </ol>
              </SheetPage>
            </Sheet>
          }
        >
          A structure you can reorder, rename or cut. Here, Scope moved above What we heard.
        </Stage>
        <Stage
          number="3"
          title="Draft"
          figure={
            <Sheet>
              <SheetChrome title="Marlow & Finch proposal">
                <span>Draft · 2 of 6</span>
              </SheetChrome>
              <SheetPage>
                <SectionLabel number="2">What we heard</SectionLabel>
                <p className="m-0 mb-3 text-base leading-[1.65]">Marlow & Finch has sold books on Bridge Street since 1987. Last year, 41% of orders came through the website, up from 12% in 2019, and the site has not changed since then.</p>
                <p className="m-0 mb-3 text-base leading-[1.65]">
                  The current checkout takes six steps and loses roughly a third of customers between the basket and payment. We propose rebuilding it as a
                  <Caret />
                </p>
              </SheetPage>
            </Sheet>
          }
        >
          Each section is written in turn, with the outline and the sections before it in view.
        </Stage>
      </ol>
    </Section>
  );
}
