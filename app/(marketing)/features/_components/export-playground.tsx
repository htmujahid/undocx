"use client";

import { useState } from "react";
import { SegmentedControl, SegmentedControlItem } from "~@/components/ui/segmented-control";
import { Sheet, SheetChrome, SheetPage } from "../../_components/doc";

type Format = "docx" | "pdf" | "md";

const title = "Proposal: a new online store for Marlow & Finch";

const sentence = "Last year the website took 2,614 orders, 41% of the total";
const locked = "The total is £18,400, fixed. Half is due on signing and half on launch.";

export function ExportPlayground() {
  const [format, setFormat] = useState<Format>("docx");
  return (
    <Sheet>
      <SheetChrome title={title}>
        <SegmentedControl aria-label="Export format" value={format} onValueChange={(v) => v && setFormat(v as Format)}>
          <SegmentedControlItem value="docx">Word</SegmentedControlItem>
          <SegmentedControlItem value="pdf">PDF</SegmentedControlItem>
          <SegmentedControlItem value="md">Markdown</SegmentedControlItem>
        </SegmentedControl>
      </SheetChrome>
      <SheetPage>
        <div key={format} className="animate-fade-in motion-reduce:animate-none" aria-live="polite">
          {format === "md" ? (
            <pre className="m-0 overflow-x-auto font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground">
{`## 2. What we heard

${sentence}[^1].

## 5. Investment

${locked}

[^1]: Sales export 2025.xlsx, sheet "Orders by channel", rows 2 to 14`}
            </pre>
          ) : (
            <div className="grid gap-5">
              <div>
                <p className="m-0 font-serif text-lg font-medium">2. What we heard</p>
                <p className="m-0 max-w-measure text-base leading-relaxed">
                  {sentence}
                  <sup className="ml-0.5 text-[0.7em]">1</sup>.
                </p>
              </div>
              <div>
                <p className="m-0 font-serif text-lg font-medium">5. Investment</p>
                <p className="m-0 max-w-measure text-base leading-relaxed">{locked}</p>
              </div>
              <div className="border-t border-border pt-3 text-sm text-muted-foreground">
                {format === "docx" ? (
                  <p className="m-0">
                    <sup>1</sup> Sales export 2025.xlsx, sheet “Orders by channel”, rows 2 to 14. <span className="ml-2 text-faint-foreground">Footnote, Word style.</span>
                  </p>
                ) : null}
                {format === "pdf" ? (
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="m-0">
                      <sup>1</sup> Sales export 2025.xlsx, sheet “Orders by channel”, rows 2 to 14.
                    </p>
                    <span className="tabular-nums text-faint-foreground">Page 2 of 4</span>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
        <p className="m-0 mt-5 border-t border-border pt-3 text-sm text-muted-foreground">
          The locked paragraph exports as ordinary text. Nothing in the file depends on Undocx.
        </p>
      </SheetPage>
    </Sheet>
  );
}
