"use client";

import { useState } from "react";
import { SegmentedControl, SegmentedControlItem } from "~@/components/ui/segmented-control";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~@/components/ui/select";
import { Sheet, SheetChrome } from "../../_components/doc";

const papers = {
  folio: { label: "Folio", width: 215.9, height: 330.2 },
  a4: { label: "A4", width: 210, height: 297 },
  letter: { label: "Letter", width: 215.9, height: 279.4 },
  legal: { label: "Legal", width: 215.9, height: 355.6 },
  executive: { label: "Executive", width: 184.2, height: 266.7 },
  b5: { label: "B5", width: 176, height: 250 },
} as const;

const margins = {
  none: { label: "None", top: 0, side: 0 },
  narrow: { label: "Narrow", top: 12.7, side: 12.7 },
  moderate: { label: "Moderate", top: 25.4, side: 19.1 },
  normal: { label: "Normal", top: 25.4, side: 25.4 },
  wide: { label: "Wide", top: 25.4, side: 50.8 },
} as const;

const itemClass = "min-w-0 flex-1 justify-center px-1 text-xs sm:text-[0.8125rem]";

type Paper = keyof typeof papers;
type Margin = keyof typeof margins;

const lines = [92, 100, 84, 100, 96, 62, 0, 100, 88, 100, 70, 0, 96, 100, 80];

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">{label}</span>
      {children}
    </div>
  );
}

export function PageSetupPlayground() {
  const [layout, setLayout] = useState<"pages" | "pageless">("pages");
  const [paper, setPaper] = useState<Paper>("a4");
  const [isLandscape, setIsLandscape] = useState(false);
  const [margin, setMargin] = useState<Margin>("normal");
  const isPages = layout === "pages";
  const size = papers[paper];
  const width = isLandscape ? size.height : size.width;
  const height = isLandscape ? size.width : size.height;
  const edge = margins[margin];
  const previewWidth = isLandscape ? 260 : 180;
  const scale = previewWidth / width;

  return (
    <Sheet>
      <SheetChrome title="Page setup">
        <span>{isPages ? `${papers[paper].label} · ${isLandscape ? "Landscape" : "Portrait"}` : "Pageless"}</span>
      </SheetChrome>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:border-r sm:border-b-0 sm:p-5">
          <Control label="Layout">
            <SegmentedControl aria-label="Layout" value={layout} onValueChange={(value) => value && setLayout(value as "pages" | "pageless")} className="w-full">
              <SegmentedControlItem value="pages" className={itemClass}>Pages</SegmentedControlItem>
              <SegmentedControlItem value="pageless" className={itemClass}>Pageless</SegmentedControlItem>
            </SegmentedControl>
          </Control>
          <Control label="Paper">
            <Select value={paper} onValueChange={(value) => value && setPaper(value as Paper)} disabled={!isPages}>
              <SelectTrigger aria-label="Paper size" className="w-full border border-input bg-card px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(papers).map(([id, { label }]) => (
                  <SelectItem key={id} value={id} label={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Control>
          <Control label="Orientation">
            <SegmentedControl aria-label="Orientation" value={isLandscape ? "landscape" : "portrait"} onValueChange={(value) => value && setIsLandscape(value === "landscape")} className="w-full">
              <SegmentedControlItem value="portrait" disabled={!isPages} className={itemClass}>
                Portrait
              </SegmentedControlItem>
              <SegmentedControlItem value="landscape" disabled={!isPages} className={itemClass}>
                Landscape
              </SegmentedControlItem>
            </SegmentedControl>
          </Control>
          <Control label="Margins">
            <SegmentedControl aria-label="Margins" value={margin} onValueChange={(value) => value && setMargin(value as Margin)} className="w-full">
              {Object.entries(margins).map(([id, { label }]) => (
                <SegmentedControlItem key={id} value={id} className={itemClass}>
                  {label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </Control>
        </div>
        <div className="flex min-h-80 flex-col items-center justify-center gap-3 bg-muted/40 p-4 sm:p-5">
          {isPages ? (
            <div
              role="img"
              aria-label={`${size.label} ${isLandscape ? "landscape" : "portrait"} page with ${edge.label.toLowerCase()} margins`}
              className="flex flex-col overflow-hidden rounded-sm border border-input bg-card shadow-xs transition-[width,height] duration-200 motion-reduce:transition-none"
              style={{ width: previewWidth, height: height * scale, paddingBlock: edge.top * scale, paddingInline: edge.side * scale }}
            >
              <div className="flex flex-col gap-1.5">
                <div className="h-2 w-2/5 rounded-full bg-foreground/70" />
                {lines.map((line, index) => (line === 0 ? <div key={index} className="h-1.5" /> : <div key={index} className="h-1 rounded-full bg-muted-foreground/30" style={{ width: `${line}%` }} />))}
              </div>
            </div>
          ) : (
            <div role="img" aria-label="Pageless document that fills the window" className="flex h-64 w-full max-w-sm flex-col gap-1.5 overflow-hidden rounded-sm border border-input bg-card" style={{ paddingBlock: edge.top * 0.35, paddingInline: edge.side * 0.35 + 12 }}>
              <div className="mt-3 h-2 w-2/5 rounded-full bg-foreground/70" />
              {lines.map((line, index) => (line === 0 ? <div key={index} className="h-1.5" /> : <div key={index} className="h-1 shrink-0 rounded-full bg-muted-foreground/30" style={{ width: `${line}%` }} />))}
            </div>
          )}
          <p className="m-0 font-mono text-xs text-muted-foreground tabular-nums">{isPages ? `${Math.round(width)} × ${Math.round(height)} mm · ${margins[margin].label.toLowerCase()} margins` : "No page edges. The text fills the window."}</p>
        </div>
      </div>
    </Sheet>
  );
}
