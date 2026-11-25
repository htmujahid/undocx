import { Section } from "../../_components/frame";
import { TypesSheet } from "./types-sheet";

const types = ["Proposal", "Report", "Article", "Case study", "Newsletter", "Your own"];

export function DocumentTypes({ number }: { number: string }) {
  return (
    <Section id="document-types" number={number} label="Document types" note="Start from a type." title="A proposal is not a report. The brief knows the difference." description="Start from a type and the brief asks what that type needs, with a typical outline to begin from.">
      <div className="flex flex-col gap-8">
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {types.map((type, index) => (
            <li key={type} className={"inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm " + (index === types.length - 1 ? "border-dashed border-input text-muted-foreground" : "border-input bg-card text-foreground")}>
              <span className="font-mono text-[0.6rem] text-primary">0{index + 1}</span>
              {type}
            </li>
          ))}
        </ul>
        <figure aria-labelledby="document-types-title" className="m-0 min-w-0">
          <TypesSheet />
        </figure>
        <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <div className="border-t border-border pt-3">
            <dt className="m-0 text-sm font-medium text-foreground">Extra questions</dt>
            <dd className="m-0 text-sm leading-normal text-muted-foreground">A price and a decision date for a proposal. A period and a source list for a report.</dd>
          </div>
          <div className="border-t border-border pt-3">
            <dt className="m-0 text-sm font-medium text-foreground">Your own</dt>
            <dd className="m-0 text-sm leading-normal text-muted-foreground">Save a brief and outline as a type and start the next one from it.</dd>
          </div>
        </dl>
      </div>
    </Section>
  );
}
