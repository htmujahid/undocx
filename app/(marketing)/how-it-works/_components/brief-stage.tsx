import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";
import { Section } from "../../_components/frame";
import { MoreLink } from "../../_components/more-link";

const questions = [
  ["Who will read this?", "Ruth Marlow, the owner, and her bookkeeper. Neither is technical.", "Asked only if no profile says it. Decides how much to explain."],
  ["What should it achieve?", "Get a yes to a three-month rebuild of the shop's checkout and catalogue.", "Puts the ask first and cuts anything that does not serve it."],
  ["Tone?", "Direct and warm. Numbers first, no jargon.", "Asked only if no voice is picked. Sets sentence length and formality."],
  ["Length?", "Four pages. Ruth reads on paper.", "Fixes the budget: what each section gets, and what is left out."],
];

export function BriefStage({ number }: { number: string }) {
  return (
    <Section id="brief" number={number} label="Brief" note="Two minutes." title="A short chat, answered once, used everywhere." description="Pick a profile, voice, rules, a type and sources if you have them, and say what you need. Undocx then asks only what is missing, one question at a time. Skip any, or press Just write it.">
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
