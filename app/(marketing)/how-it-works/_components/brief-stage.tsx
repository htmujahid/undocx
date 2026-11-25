import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";
import { Section } from "../../_components/frame";
import { MoreLink } from "../../_components/more-link";

const questions = [
  ["Who will read this?", "Ruth Marlow, the owner, and her bookkeeper. Neither is technical.", "Decides how much to explain and which words need no explanation."],
  ["What should it achieve?", "Get a yes to a three-month rebuild of the shop's checkout and catalogue.", "Puts the ask first and cuts anything that does not serve it."],
  ["Tone?", "Direct and warm. Numbers first, no jargon.", "Sets sentence length, formality and how directly numbers are stated."],
  ["Length?", "Four pages. Ruth reads on paper.", "Fixes the budget: what each section gets, and what is left out."],
];

export function BriefStage({ number }: { number: string }) {
  return (
    <Section id="brief" number={number} label="Brief" note="Two minutes." title="Four questions, answered once, used everywhere." description="The shortest part and the most important. Everything after it is written against these answers.">
      <div className="flex flex-col gap-6">
        <Sheet>
          <SheetChrome title="Untitled proposal">
            <span>Brief</span>
          </SheetChrome>
          <SheetPage>
            <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {questions.map(([q, a, effect]) => (
                <div key={q} className="grid gap-1">
                  <dt className="m-0 font-serif text-base text-muted-foreground italic">{q}</dt>
                  <dd className="m-0 text-base text-foreground">{a}</dd>
                  <dd className="m-0 border-l-2 border-primary/40 pl-3 text-sm leading-normal text-muted-foreground">{effect}</dd>
                </div>
              ))}
            </dl>
          </SheetPage>
        </Sheet>
        <MoreLink href="/features#brief">About the brief</MoreLink>
      </div>
    </Section>
  );
}
