import { Section } from "../../_components/frame";
import { PagePlayground } from "./page-playground";

const facts = [
  ["Continuous", "Headings, lists, tables, quotes and task lists, in one scroll."],
  ["Markdown underneath", "What you see is what exports."],
  ["Focus mode", "Just the page, one press away."],
];

export function OnePage({ number }: { number: string }) {
  return (
    <Section id="one-page" number={number} label="One page" note="Scroll it." title="One continuous document. The outline follows you." description="Scroll the whole draft like a page, not a deck of cards. The outline tracks where you are, and focus mode hides everything but the text." tone="muted">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <figure aria-labelledby="one-page-title" className="m-0 min-w-0">
          <PagePlayground />
        </figure>
        <ul className="m-0 grid list-none gap-5 p-0 lg:border-l lg:border-border lg:pl-6">
          {facts.map(([term, text]) => (
            <li key={term}>
              <p className="m-0 text-sm font-medium text-foreground">{term}</p>
              <p className="m-0 mt-0.5 text-sm leading-normal text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
