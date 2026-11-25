import { Section } from "../../_components/frame";
import { LockPlayground } from "./lock-playground";

const spec = [
  ["Any grain", "A sentence, a paragraph, a section."],
  ["Reported", "Skipped locks are counted, not hidden."],
  ["Exports plain", "Locks never show in the file."],
  ["Margin only", "The document itself never changes look."],
];

export function LockedText({ number }: { number: string }) {
  return (
    <Section id="locked-text" number={number} label="Locked text" note="Try it." title="Mark a passage final. It stays final." description="Lock any paragraph, then tighten the whole section. Locked text is skipped and reported." tone="accent">
      <div className="flex flex-col gap-8">
        <blockquote className="m-0 grid gap-3 border-l-2 border-primary pl-5">
          <p className="m-0 max-w-measure font-serif text-2xl leading-snug text-foreground italic sm:text-3xl">“The total is £18,400, fixed. Half is due on signing and half on launch, and it will not change unless the scope does.”</p>
          <cite className="font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase not-italic">§5 Investment · locked, survives every rewrite</cite>
        </blockquote>
        <figure aria-labelledby="locked-text-title" className="m-0 min-w-0">
          <LockPlayground />
        </figure>
        <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          {spec.map(([term, text]) => (
            <div key={term} className="flex items-baseline justify-between gap-4 border-b border-border py-2 text-sm">
              <dt className="m-0 font-medium whitespace-nowrap text-foreground">{term}</dt>
              <dd className="m-0 text-right text-muted-foreground">{text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
