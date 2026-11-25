import { Section } from "../../_components/frame";
import { VariationsPlayground } from "./variations-playground";

const letters = [
  ["A", "Shorter", "Half the length, both numbers kept."],
  ["B", "Plainer", "For a reader who is not technical."],
  ["C", "Customer first", "Opens with what they get."],
];

export function Variations({ number }: { number: string }) {
  return (
    <Section id="variations" number={number} label="Variations" note="Try it." title="Three versions of one sentence. Pick one, or take the best of each." description="Side by side, not one after another. Choose one, or merge two.">
      <div className="flex flex-col gap-8">
        <ol className="m-0 grid list-none grid-cols-3 gap-3 p-0">
          {letters.map(([letter, term, text]) => (
            <li key={letter} className="grid gap-1 border-t-2 border-primary pt-3">
              <span className="font-serif text-4xl leading-none text-primary">{letter}</span>
              <span className="text-sm font-medium text-foreground">{term}</span>
              <span className="hidden text-sm leading-normal text-muted-foreground sm:block">{text}</span>
            </li>
          ))}
        </ol>
        <figure aria-labelledby="variations-title" className="m-0 min-w-0">
          <VariationsPlayground />
        </figure>
        <p className="m-0 max-w-measure text-sm leading-normal text-muted-foreground">Each version keeps the instruction that made it. Merge an opening from one with an ending from another. The original waits until you choose.</p>
      </div>
    </Section>
  );
}
