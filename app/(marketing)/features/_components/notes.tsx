import { CheckIcon, LockIcon, NoteIcon } from "~@/components/ui/icons";
import { Section } from "../../_components/frame";
import { NotesPlayground } from "./notes-playground";

const cards = [
  { term: "Yours alone", text: "No reader, reviewer or export ever sees one.", Icon: LockIcon },
  { term: "On the paragraph", text: "It stays with the text through every rewrite.", Icon: NoteIcon },
  { term: "Resolve", text: "One press when it is dealt with.", Icon: CheckIcon },
];

export function Notes({ number }: { number: string }) {
  return (
    <Section id="notes" number={number} label="Notes to self" note="Try it." title="A note in the margin that only you can see." description="Leave yourself a reminder on any paragraph. Press the mark to find it, resolve it when it is done." tone="muted">
      <div className="flex flex-col gap-8">
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-3">
          {cards.map(({ term, text, Icon }, index) => (
            <li key={term} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
              <span className="flex items-center justify-between">
                <Icon className="size-5 text-primary" />
                <span className="font-mono text-[0.6rem] tracking-[0.15em] text-faint-foreground uppercase">0{index + 1}</span>
              </span>
              <span className="text-base font-medium text-foreground">{term}</span>
              <span className="text-sm leading-normal text-muted-foreground">{text}</span>
            </li>
          ))}
        </ul>
        <figure aria-labelledby="notes-title" className="m-0 min-w-0">
          <NotesPlayground />
        </figure>
      </div>
    </Section>
  );
}
