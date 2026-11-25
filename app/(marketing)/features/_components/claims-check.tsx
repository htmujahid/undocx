import { CheckIcon } from "~@/components/ui/icons";
import { Section } from "../../_components/frame";
import { ClaimsSheet } from "./claims-sheet";

const facts = [
  ["Numbers, dates, quotes", "Each linked to its citation."],
  ["Stale", "Source changed since the draft."],
  ["Appendix", "Export the list with the document."],
];

export function ClaimsCheck({ number }: { number: string }) {
  return (
    <Section id="claims-check" number={number} label="Claims check" note="Before you send." title="Every number in the document, listed with where it came from." description="Unsourced claims first, stale sources flagged, the rest cited. Run it before you send." tone="muted">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <ul className="m-0 order-2 grid list-none gap-3 p-0 lg:order-1">
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
        <figure aria-labelledby="claims-check-title" className="order-1 m-0 min-w-0 lg:order-2">
          <ClaimsSheet />
        </figure>
      </div>
    </Section>
  );
}
