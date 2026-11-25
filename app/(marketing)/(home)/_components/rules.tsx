import { CheckIcon, LockIcon } from "~@/components/ui/icons";
import { Section } from "../../_components/frame";

const may = [
  ["Write a section you approved in the outline", "Once, when the draft is made, and again only if you ask."],
  ["Rewrite the passage you pointed at", "With the instruction you gave, shown as a diff until you keep it."],
  ["Propose variations", "Beside the original, never in place of it."],
  ["Mark what it is unsure of", "An unsourced number, a rule it could not follow, a section over its budget."],
];

const never = [
  ["Touch locked text", "Not in a paragraph rewrite, not in a section rewrite, not in a merge."],
  ["Change text outside the scope you chose", "A paragraph instruction changes that paragraph. Nothing above or below it."],
  ["Replace anything without a diff", "Every change is shown before it is kept, and every kept change can be undone."],
  ["Learn from your documents for anyone else", "Samples and documents are used for your drafts only."],
];

export function Rules({ number }: { number: string }) {
  return (
    <Section id="rules" number={number} label="The rules" note="May and never." title="What the AI may do, and what it never does." description="These are not settings. They are how the editor is built, and they hold on every document." tone="muted">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h3 className="m-0 mb-4 flex items-center gap-2 font-serif text-2xl font-medium text-foreground">
            <CheckIcon className="size-5 text-muted-foreground" />
            It may
          </h3>
          <ul className="m-0 grid list-none gap-y-4 p-0">
            {may.map(([t, d]) => (
              <li key={t} className="border-t border-input pt-3">
                <p className="m-0 text-base font-medium text-foreground">{t}</p>
                <p className="m-0 text-sm leading-normal text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="m-0 mb-4 flex items-center gap-2 font-serif text-2xl font-medium text-primary">
            <LockIcon className="size-5" />
            It never
          </h3>
          <ul className="m-0 grid list-none gap-y-4 p-0">
            {never.map(([t, d]) => (
              <li key={t} className="border-t border-primary/40 pt-3">
                <p className="m-0 text-base font-medium text-foreground">{t}</p>
                <p className="m-0 text-sm leading-normal text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
