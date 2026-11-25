import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";

const types = [
  { name: "Proposal", extra: "Price, decision date, what is out of scope", outline: "Summary · What we heard · Scope · Timeline · Investment · Next steps", isChosen: true },
  { name: "Report", extra: "Period covered, method, who commissioned it", outline: "Summary · Method · Findings · Risks · Recommendation · Appendix" },
  { name: "Article", extra: "Publication, word limit, one takeaway", outline: "Opening · The problem · What changed · What to do · Sign-off" },
  { name: "Case study", extra: "Client, the before, the measurable after", outline: "Context · Problem · What we did · Result · Quote" },
  { name: "Newsletter", extra: "Issue date, the one link that matters", outline: "Hello · One story · Three short items · The link" },
];

export function TypesSheet() {
  return (
    <Sheet>
      <SheetChrome title="New document">
        <span>Choose a type</span>
      </SheetChrome>
      <SheetPage>
        <ul aria-label="Document types" className="m-0 grid list-none gap-y-0 p-0">
          {types.map((type) => (
            <li
              key={type.name}
              className={
                "grid grid-cols-1 gap-y-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[minmax(0,8rem)_minmax(0,1fr)] sm:gap-x-4" +
                (type.isChosen ? " -mx-2 rounded-sm bg-primary/10 px-2" : "")
              }
            >
              <span className={type.isChosen ? "font-serif text-lg text-primary" : "font-serif text-lg text-foreground"}>{type.name}</span>
              <span className="text-sm">
                <span className="block text-foreground">
                  <span className="text-muted-foreground">Also asks: </span>
                  {type.extra}
                </span>
                <span className="block text-muted-foreground">{type.outline}</span>
              </span>
            </li>
          ))}
        </ul>
      </SheetPage>
    </Sheet>
  );
}
