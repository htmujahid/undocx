import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";
import { Body, Section } from "../../_components/frame";
import { MoreLink } from "../../_components/more-link";

const sections = [
  ["Summary", "The yes we are asking for, in six lines."],
  ["Scope of work", "Checkout, catalogue, order emails. What is out.", true],
  ["What we heard", "Three visits, two staff interviews, one afternoon on the till."],
  ["Timeline", "Twelve weeks, three checkpoints."],
  ["Investment", "One fixed price, two payments."],
  ["Next steps", "What happens when Ruth signs."],
] as const;

export function OutlineStage({ number }: { number: string }) {
  return (
    <Section id="outline" number={number} label="Outline" note="Reorder, rename, cut." title="A structure, for the documents that need one." description="A proposal or report gets an outline you can reorder, rename, cut or add to. A short note or letter skips it and goes straight to a draft. Approve it and the draft begins.">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Body>Undocx decides from your prompt whether an outline will help, and you can switch it on or off. When it does, it proposes the sections, in order, each with a line on what it will cover. For this proposal the writer moved Scope of work up so Ruth sees what she is buying before she reads why.</Body>
          <Body>Each section is then written with the outline and the sections before it in view, which keeps a long document reading as one piece.</Body>
          <MoreLink href="/features#outline">About the outline</MoreLink>
        </div>
        <Sheet>
          <SheetChrome title="Marlow & Finch proposal">
            <span>Outline</span>
          </SheetChrome>
          <SheetPage>
            <ol className="m-0 list-none p-0">
              {sections.map(([title, note, moved], index) => (
                <li key={title} className={"grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 border-b border-border py-2 text-base" + (moved ? " -mx-2 rounded-sm bg-primary/10 px-2" : "")}>
                  <span className="font-serif tabular-nums text-primary">{index + 1}</span>
                  <span>
                    <span className="font-medium">{title}</span>
                    {moved ? <span className="ml-2 text-sm text-primary">moved up</span> : null}
                    <span className="block text-sm text-muted-foreground">{note}</span>
                  </span>
                </li>
              ))}
            </ol>
          </SheetPage>
        </Sheet>
      </div>
    </Section>
  );
}
