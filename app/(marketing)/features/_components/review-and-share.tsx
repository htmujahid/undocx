import { Section } from "../../_components/frame";
import { ReviewSheet } from "./review-sheet";

const facts = [
  ["Read-only links", "With expiry."],
  ["Apply as instruction", "A comment becomes a rewrite."],
  ["Versions", "Name one, or keep an AI change and it saves one. Restore any."],
];

export function ReviewAndShare({ number }: { number: string }) {
  return (
    <Section id="review-and-share" number={number} label="Review and share" note="One link." title="Send a link. Get comments on paragraphs, not on a PDF." description="A reviewer comments without an account. One press turns the comment into a rewrite you can keep or undo.">
      <div className="flex flex-col gap-8">
        <figure aria-labelledby="review-and-share-title" className="m-0 min-w-0">
          <ReviewSheet />
        </figure>
        <ol className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-4 p-0 sm:grid-cols-3">
          {facts.map(([term, text], index) => (
            <li key={term} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-2 border-t border-border pt-3">
              <span className="font-serif text-3xl leading-none text-primary">{index + 1}</span>
              <div>
                <p className="m-0 text-sm font-medium text-foreground">{term}</p>
                <p className="m-0 mt-0.5 text-sm leading-normal text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
