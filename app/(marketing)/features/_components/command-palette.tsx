import { Section } from "../../_components/frame";
import { PalettePlayground } from "./palette-playground";

const facts = [
  ["Everything", "Rewrite, lock, variations, notes, export."],
  ["Go anywhere", "Sections and sources, by name."],
  ["Shortcuts shown", "Learn the key as you use it."],
];

export function CommandPalette({ number }: { number: string }) {
  return (
    <Section id="command-palette" number={number} label="Command palette" note="⌘K." title="Press ⌘K and say what you want." description="Every action, section and source by name. Type a few letters, press Enter, done. Try it here.">
      <div className="flex flex-col gap-8">
        <figure aria-labelledby="command-palette-title" className="m-0 min-w-0">
          <PalettePlayground />
        </figure>
        <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3">
          {facts.map(([term, text], index) => (
            <div key={term} className="border-t border-border pt-3">
              <dt className="m-0 flex items-baseline gap-2 text-sm font-medium text-foreground">
                <span className="font-mono text-[0.65rem] text-primary">0{index + 1}</span>
                {term}
              </dt>
              <dd className="m-0 text-sm leading-normal text-muted-foreground">{text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
