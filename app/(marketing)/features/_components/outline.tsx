import { Section } from "../../_components/frame";
import { OutlinePlayground } from "./outline-playground";

const steps = [
  ["Reorder", "Arrow keys or drag. The numbers follow."],
  ["Rebalance", "Words per section, worked out from the brief."],
  ["Approve", "Nothing is drafted before you say so."],
];

export function Outline({ number }: { number: string }) {
  return (
    <Section id="outline" number={number} label="Outline first" note="Try it." title="A structure you can change before anything is written." description="Move a section and the length budget rebalances. Add one and the others make room." tone="muted">
      <div className="flex flex-col gap-8">
        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3 sm:gap-0">
          {steps.map(([term, text], index) => (
            <li key={term} className="flex flex-col gap-2 sm:pr-8">
              <span className="flex items-center gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs text-primary-foreground">{index + 1}</span>
                {index < steps.length - 1 ? <span aria-hidden="true" className="hidden h-px flex-1 bg-border sm:block" /> : null}
              </span>
              <p className="m-0 text-base font-medium text-foreground">{term}</p>
              <p className="m-0 text-sm leading-normal text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
        <figure aria-labelledby="outline-title" className="m-0 min-w-0">
          <OutlinePlayground />
        </figure>
      </div>
    </Section>
  );
}
