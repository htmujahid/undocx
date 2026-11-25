import { Section } from "../../_components/frame";
import { RegeneratePlayground } from "./regenerate-playground";

const facts = [
  ["Presets", "Shorter, plainer, lead with the number."],
  ["Diff first", "Cut struck through, new underlined."],
  ["Undo", "One step, always."],
];

export function SectionRegenerate({ number }: { number: string }) {
  return (
    <Section id="section-regenerate" number={number} label="Section regenerate" note="Try it." title="Rewrite paragraph three. Leave the other nine alone." description="Pick an instruction. Only the middle paragraph changes, shown as a diff until you keep it.">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <figure aria-labelledby="section-regenerate-title" className="m-0 min-w-0">
          <RegeneratePlayground />
        </figure>
        <ol className="m-0 grid list-none gap-5 p-0 lg:border-l lg:border-border lg:pl-6">
          {facts.map(([term, text], index) => (
            <li key={term} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2">
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
