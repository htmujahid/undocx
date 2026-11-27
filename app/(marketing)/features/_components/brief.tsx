import { Section } from "../../_components/frame";
import { BriefPlayground } from "./brief-playground";

const facts = [
  ["Made for the document", "Questions come from your prompt, not a fixed form."],
  ["Skip any", "Or press Just write it and let Undocx assume."],
  ["Edit later", "Change a pick and choose whether to re-run."],
];

export function Brief({ number }: { number: string }) {
  return (
    <Section id="brief" number={number} label="Brief first" note="Try it." title="Say what you need. It asks only what it is missing." description="Pick a profile, voice, rules and sources if you have them, write a line, then answer a few questions made for that document. Skip any of them.">
      <div className="flex flex-col gap-8">
        <p className="m-0 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-y border-border py-5">
          <span className="font-serif text-5xl leading-none tracking-tight text-primary sm:text-6xl">5</span>
          <span className="max-w-[32ch] text-base leading-snug text-foreground">questions at most, one at a time. It never asks what your profile or voice already says.</span>
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
