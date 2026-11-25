import { Instruction, SectionLabel, Sheet, SheetChrome, SheetPage, paragraphClass } from "../../_components/doc";

const versions = [
  { label: "v4", when: "Today, 9:31", note: "Summary opening merged from B and C", isCurrent: true },
  { label: "v3", when: "Today, 9:25", note: "Paragraph two rewritten: lead with the customer", isCurrent: false },
  { label: "v2", when: "Today, 9:22", note: "Price and quote locked", isCurrent: false },
  { label: "v1", when: "Today, 9:17", note: "First draft from the outline", isCurrent: false },
];

export function ReviewSheet() {
  return (
    <Sheet>
      <SheetChrome title="Proposal: a new online store for Marlow & Finch">
        <span>Shared with Ruth Marlow · read only</span>
      </SheetChrome>
      <SheetPage>
        <SectionLabel number="2">What we heard</SectionLabel>
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
          <p className={paragraphClass + " rounded-sm bg-primary/10 -mx-2 px-2 py-1"}>The current checkout takes six steps and loses roughly a third of customers between the basket and payment. We propose rebuilding it as a two-step flow, with guest checkout and saved addresses, and measuring the drop-off at each step from launch.</p>
          <aside aria-label="Comment" className="rounded-md border border-border bg-background p-3 text-sm">
            <p className="m-0 font-medium text-foreground">Ruth Marlow</p>
            <p className="m-0 text-xs text-muted-foreground">Yesterday, 17:40</p>
            <p className="m-0 mt-2 text-muted-foreground">
              Can this say what the customer sees rather than what the site does? Half our orders are from people over sixty.
            </p>
            <p className="m-0 mt-3 text-xs font-medium text-primary">Apply as instruction →</p>
          </aside>
        </div>
        <Instruction label="Applied">Say what the customer sees, not what the site does</Instruction>
        <ol aria-label="Versions" className="m-0 mt-2 grid max-w-measure list-none gap-y-1.5 border-t border-border p-0 pt-3 text-sm">
          {versions.map((version) => (
            <li key={version.label} className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-baseline gap-x-2">
              <span className={version.isCurrent ? "font-medium text-primary tabular-nums" : "text-muted-foreground tabular-nums"}>{version.label}</span>
              <span className="text-foreground">{version.note}</span>
              <span className="text-muted-foreground">{version.when}</span>
            </li>
          ))}
        </ol>
      </SheetPage>
    </Sheet>
  );
}
