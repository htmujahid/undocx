"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { SegmentedControl, SegmentedControlItem } from "~@/components/ui/segmented-control";
import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";

const pieces = [
  { title: "Checkout", text: "Six screens down to two. Guest checkout and one payment step." },
  { title: "Catalogue", text: "Search first, with filters by author and format." },
  { title: "Order emails", text: "Confirmed, posted and ready to collect." },
  { title: "Handover", text: "A day of training and a month of fixes." },
];

type Kind = "text" | "lists" | "tables" | "quotes" | "columns";

const kinds: { id: Kind; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "lists", label: "Lists" },
  { id: "tables", label: "Tables" },
  { id: "quotes", label: "Quotes" },
  { id: "columns", label: "Columns" },
];

const cell = "border border-input px-3 py-1.5 text-left text-sm";

function view(kind: Kind): { body: ReactNode; markdown: string } {
  switch (kind) {
    case "text":
      return {
        body: (
          <>
            <h3 className="m-0 mb-2 font-serif text-2xl font-medium text-foreground">Scope of work</h3>
            <p className="m-0 max-w-measure">
              Three pieces of work, in the order customers meet them. Each has a <strong>definition of done</strong> that Ruth can check, and the <em>price</em> is <a href="#rich-text" className="text-primary underline">fixed</a>.
            </p>
          </>
        ),
        markdown: "## Scope of work\n\nThree pieces of work, in the order customers meet them. Each has a **definition of done** that Ruth can check, and the *price* is [fixed](https://example.com).",
      };
    case "lists":
      return {
        body: (
          <div className="grid gap-4 sm:grid-cols-3">
            <ul className="m-0 list-disc pl-5">
              <li>Checkout</li>
              <li>Catalogue</li>
              <li>Order emails</li>
            </ul>
            <ol className="m-0 list-decimal pl-5">
              <li>Sign</li>
              <li>Send the logo files</li>
              <li>Book week four</li>
            </ol>
            <ul className="m-0 list-none p-0">
              <li className="flex items-center gap-2">
                <input type="checkbox" defaultChecked aria-label="Export products" /> Export products
              </li>
              <li className="flex items-center gap-2">
                <input type="checkbox" aria-label="Approve designs" /> Approve designs
              </li>
            </ul>
          </div>
        ),
        markdown: "- Checkout\n- Catalogue\n- Order emails\n\n1. Sign\n2. Send the logo files\n3. Book week four\n\n- [x] Export products\n- [ ] Approve designs",
      };
    case "tables":
      return {
        body: (
          <table className="w-full max-w-md border-collapse">
            <thead>
              <tr>
                <th className={cell}>Payment</th>
                <th className={cell}>When</th>
                <th className={cell}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={cell}>First half</td>
                <td className={cell}>On signing</td>
                <td className={cell}>£9,200</td>
              </tr>
              <tr>
                <td className={cell}>Second half</td>
                <td className={cell}>On launch</td>
                <td className={cell}>£9,200</td>
              </tr>
            </tbody>
          </table>
        ),
        markdown: "| Payment | When | Amount |\n| --- | --- | --- |\n| First half | On signing | £9,200 |\n| Second half | On launch | £9,200 |",
      };
    case "quotes":
      return {
        body: (
          <>
            <blockquote className="m-0 border-l-2 border-primary pl-4 font-serif text-lg text-foreground italic">“Half of our orders now come through the website.”</blockquote>
            <hr className="my-5 border-0 border-t border-input" />
            <p className="m-0 text-muted-foreground">A divider, then the next section.</p>
          </>
        ),
        markdown: "> “Half of our orders now come through the website.”\n\n---\n\nA divider, then the next section.",
      };
    case "columns": {
      const shown = pieces.slice(0, 3);
      return {
        body: (
          <div className="grid gap-x-5 gap-y-4 sm:[grid-template-columns:repeat(var(--columns),minmax(0,1fr))]" style={{ "--columns": 3 } as CSSProperties}>
            {shown.map((piece) => (
              <div key={piece.title} className="min-w-0 rounded-md border border-dashed border-input p-3">
                <h3 className="m-0 mb-1 font-serif text-lg font-medium text-foreground">{piece.title}</h3>
                <p className="m-0 text-sm leading-normal text-muted-foreground">{piece.text}</p>
              </div>
            ))}
          </div>
        ),
        markdown: `|${shown.map((piece) => ` **${piece.title}**: ${piece.text} `).join("|")}|\n|${shown.map(() => " --- ").join("|")}|`,
      };
    }
  }
}

export function RichTextPlayground() {
  const [kind, setKind] = useState<Kind>("text");
  const { body, markdown } = view(kind);

  return (
    <Sheet>
      <SheetChrome title="Proposal: a new online store for Marlow & Finch" />
      <div className="overflow-x-auto border-b border-border bg-background px-3 py-2 sm:px-5">
        <SegmentedControl aria-label="Block type" value={kind} onValueChange={(value) => value && setKind(value as Kind)}>
          {kinds.map(({ id, label }) => (
            <SegmentedControlItem key={id} value={id}>
              {label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
      <SheetPage className="min-h-56">
        {body}
        <div className="mt-6 border-t border-border pt-4">
          <p className="m-0 mb-2 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">In the Markdown export</p>
          <pre className="m-0 overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed text-foreground">{markdown}</pre>
        </div>
      </SheetPage>
    </Sheet>
  );
}
