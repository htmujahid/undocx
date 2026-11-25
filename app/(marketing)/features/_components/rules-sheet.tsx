import { CheckIcon } from "~@/components/ui/icons";
import { Instruction, SectionLabel, Sheet, SheetChrome, SheetPage, addedClass, paragraphClass, removedClass } from "../../_components/doc";

const rules = [
  { rule: "British spelling", state: "ok" },
  { rule: "Never “leverage”, “seamless” or “robust”", state: "broken" },
  { rule: "Prices with a currency symbol, no decimals", state: "ok" },
  { rule: "No exclamation marks", state: "ok" },
] as const;

export function RulesSheet() {
  return (
    <Sheet>
      <SheetChrome title="Proposal: a new online store for Marlow & Finch">
        <span>House rules · Studio Ashby</span>
      </SheetChrome>
      <SheetPage>
        <SectionLabel number="3">Scope of work</SectionLabel>
        <p className={paragraphClass}>
          We will <del className={removedClass}>leverage</del> <ins className={addedClass}>use</ins> the existing product photography and{" "}
          <del className={removedClass}>deliver a seamless checkout</del> <ins className={addedClass}>cut the checkout to two steps</ins>, with
          the same £30 hosting as now.
        </p>
        <Instruction label="Rule broken">Never “leverage”, “seamless” or “robust” — fixed</Instruction>
        <ul aria-label="Rules checked" className="m-0 mt-2 grid max-w-measure list-none gap-y-1.5 border-t border-border p-0 pt-3 text-sm">
          {rules.map((item) => (
            <li key={item.rule} className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-baseline gap-x-2">
              <span className={item.state === "broken" ? "text-primary" : "text-muted-foreground"}>
                <CheckIcon className="size-3 translate-y-px" />
              </span>
              <span className="text-foreground">{item.rule}</span>
              <span className={item.state === "broken" ? "font-medium text-primary" : "text-muted-foreground"}>
                {item.state === "broken" ? "1 fixed" : "Followed"}
              </span>
            </li>
          ))}
        </ul>
      </SheetPage>
    </Sheet>
  );
}
