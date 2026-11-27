import { Section } from "../../_components/frame";
import { RichTextPlayground } from "./rich-text-playground";

const facts = [
  ["Text", "Headings, bold, italic, links, alignment and fonts."],
  ["Blocks", "Lists, task lists, tables, quotes and dividers."],
  ["Columns", "Side by side in a row, and removable without losing text."],
  ["Markdown underneath", "Type it or export it. Columns export as a plain row."],
];

export function RichText({ number }: { number: string }) {
  return (
    <Section id="rich-text" number={number} label="Rich text" note="Try it." title="A real editor under the draft." description="Everything you expect from a document, so the draft never has to leave. Switch the block type and see exactly how it exports." tone="accent">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <figure aria-labelledby="rich-text-title" className="m-0 min-w-0">
          <RichTextPlayground />
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
