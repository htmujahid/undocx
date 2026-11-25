import { Section } from "../../_components/frame";
import { BriefPlayground } from "./brief-playground";

const facts = [
  ["Four questions", "Audience, goal, tone, length."],
  ["Reader profiles", "Save a client; reuse them."],
  ["Edit later", "The draft follows the change."],
];

export function Brief({ number }: { number: string }) {
  return (
    <Section id="brief" number={number} label="Brief first" note="Try it." title="Four questions before the first word." description="Change the tone or the length and watch the opening and the section budget follow.">
      <div className="flex flex-col gap-8">
        <p className="m-0 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-y border-border py-5">
          <span className="font-serif text-5xl leading-none tracking-tight text-primary sm:text-6xl">4</span>
          <span className="max-w-[28ch] text-base leading-snug text-foreground">questions before the first word. Change one later and the draft follows.</span>
        </p>
        <figure aria-labelledby="brief-title" className="m-0 min-w-0">
          <BriefPlayground />
        </figure>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {facts.map(([term, text]) => (
            <li key={term} className="inline-flex max-w-full items-baseline gap-2 rounded-full border border-input bg-card py-1.5 pr-4 pl-3 text-sm">
              <span className="font-medium whitespace-nowrap text-foreground">{term}</span>
              <span className="text-muted-foreground">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
