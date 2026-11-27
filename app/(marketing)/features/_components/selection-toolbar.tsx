import { Section } from "../../_components/frame";
import { SelectionToolbarPlayground } from "./selection-toolbar-playground";

const facts = [
  ["Rewrite", "Pick an instruction. The result comes back as a diff."],
  ["Ask", "Question the passage without leaving it."],
  ["Check claims", "Numbers and dates in the selection, not the whole file."],
  ["Note", "Start a private note on the exact words."],
];

export function SelectionToolbar({ number }: { number: string }) {
  return (
    <Section id="selection-toolbar" number={number} label="Selection toolbar" note="Try it." title="Select a few words. The tools are already there." description="Highlight a sentence and a small toolbar appears over it, with rewrite, ask, variations, claims check and a note. Only the selection changes." tone="paper">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <figure aria-labelledby="selection-toolbar-title" className="m-0 min-w-0">
          <SelectionToolbarPlayground />
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
