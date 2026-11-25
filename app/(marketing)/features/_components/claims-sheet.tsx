import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";

const claims = [
  { claim: "One in five phone orders is a customer who gave up online", source: "No source", state: "missing" },
  { claim: "2,614 orders, 41% of the total", source: "Sales export 2025.xlsx · rows 2 to 14", state: "ok" },
  { claim: "Average basket £27.80", source: "Sales export 2025.xlsx · row 16", state: "ok" },
  { claim: "34% of started checkouts abandoned", source: "Shopify analytics · funnel report", state: "ok" },
  { claim: "Website unchanged since 2019", source: "Staff interview notes.docx · page 1", state: "stale" },
] as const;

const stateLabel = { missing: "Attach, cut, or mark as estimate", ok: "Cited", stale: "Source changed since draft" } as const;

export function ClaimsSheet() {
  return (
    <Sheet>
      <SheetChrome title="Proposal: a new online store for Marlow & Finch">
        <span>Claims check · 5 claims</span>
      </SheetChrome>
      <SheetPage>
        <p className="m-0 mb-3 text-sm text-muted-foreground">
          <span className="font-medium text-primary">1 unsourced</span> · 1 stale · 3 cited
        </p>
        <ol aria-label="Claims" className="m-0 grid list-none gap-y-0 p-0 text-sm">
          {claims.map((item, index) => (
            <li key={item.claim} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 border-b border-border py-2.5 last:border-b-0 sm:grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,14rem)] sm:gap-x-4">
              <span className="tabular-nums text-primary">{index + 1}</span>
              <span>
                <span className="block text-base text-foreground">{item.claim}</span>
                <span className="block text-muted-foreground">{item.source}</span>
              </span>
              <span className={item.state === "ok" ? "text-muted-foreground sm:text-right" : "font-medium text-primary sm:text-right"}>{stateLabel[item.state]}</span>
            </li>
          ))}
        </ol>
      </SheetPage>
    </Sheet>
  );
}
