import { CheckIcon } from "~@/components/ui/icons";
import { Section } from "../../_components/frame";
import { RulesSheet } from "./rules-sheet";

const facts = [
  ["Plain words", "Write the rule as you would say it."],
  ["Rule sets", "One per client or publication."],
  ["Rules win", "Over samples, when they disagree."],
];

export function HouseRules({ number }: { number: string }) {
  return (
    <Section id="house-rules" number={number} label="House rules" note="One press." title="Rules the draft follows every time, without being told twice." description="British spelling, banned words, how prices are written. Checked on demand, spelling fixed in one press." tone="muted">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <figure aria-labelledby="house-rules-title" className="m-0 min-w-0">
          <RulesSheet />
        </figure>
        <ul className="m-0 grid list-none gap-3 p-0">
          {facts.map(([term, text]) => (
            <li key={term} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-2">
              <CheckIcon className="mt-1 size-3.5 text-primary" />
              <div>
                <p className="m-0 text-sm font-medium text-foreground">{term}</p>
                <p className="m-0 text-sm leading-normal text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
