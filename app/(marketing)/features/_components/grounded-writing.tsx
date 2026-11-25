import { Section } from "../../_components/frame";
import { SourcesPlayground } from "./sources-playground";

const steps = [
  ["Attach", "PDF, Word, spreadsheets, CSV, links, pasted text."],
  ["Cite", "Every figure opens its source at the row, page or paragraph."],
  ["Catch", "A number with no source is marked before you send."],
];

export function GroundedWriting({ number }: { number: string }) {
  return (
    <Section id="grounded-writing" number={number} label="Grounded writing" note="Citations that open." title="Every number points back to the file it came from." description="Click a citation to see the row it came from. Remove a source and see which claims lose their footing." tone="accent">
      <div className="flex flex-col gap-8">
        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3 sm:gap-0">
          {steps.map(([term, text], index) => (
            <li key={term} className="flex flex-col gap-2 sm:pr-8">
              <span className="flex items-center gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs text-primary-foreground">{index + 1}</span>
                {index < steps.length - 1 ? <span aria-hidden="true" className="hidden h-px flex-1 bg-primary/30 sm:block" /> : null}
              </span>
              <p className="m-0 text-base font-medium text-foreground">{term}</p>
              <p className="m-0 text-sm leading-normal text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
        <figure aria-labelledby="grounded-writing-title" className="m-0 min-w-0">
          <SourcesPlayground />
        </figure>
      </div>
    </Section>
  );
}
