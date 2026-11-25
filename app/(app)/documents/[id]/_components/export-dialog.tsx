"use client";

import { useState } from "react";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "~@/components/ui/dialog";
import { DownloadIcon, XIcon } from "~@/components/ui/icons";
import { SegmentedControl, SegmentedControlItem } from "~@/components/ui/segmented-control";

type Format = "docx" | "pdf" | "md" | "gdoc";

const notes: Record<Format, string> = {
  docx: "Citations become footnotes. Locked paragraphs are ordinary text. Headings, lists and the table come through intact.",
  pdf: "Page numbers and a sources list at the end. Nothing in the file depends on Undocx.",
  md: "Plain headings and numbered footnote links. Alignment is dropped; everything else survives.",
  gdoc: "A new document in your Drive, ready to share. Citations in a Sources section at the end.",
};

export function ExportDialog() {
  const [format, setFormat] = useState<Format>("docx");
  return (
    <Dialog>
      <DialogTrigger shortcut="mod+e" render={<Button size="sm" />}>
        <DownloadIcon />
        Export
      </DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="grid gap-1">
            <DialogTitle>Export</DialogTitle>
            <DialogDescription>See how the file comes out before you download it.</DialogDescription>
          </div>
          <DialogClose aria-label="Close" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <XIcon />
          </DialogClose>
        </div>
        <div className="grid gap-4 p-5">
          <SegmentedControl aria-label="Format" value={format} onValueChange={(v) => v && setFormat(v as Format)} className="w-full">
            <SegmentedControlItem value="docx" className="flex-1 justify-center">
              Word
            </SegmentedControlItem>
            <SegmentedControlItem value="pdf" className="flex-1 justify-center">
              PDF
            </SegmentedControlItem>
            <SegmentedControlItem value="md" className="flex-1 justify-center">
              Markdown
            </SegmentedControlItem>
            <SegmentedControlItem value="gdoc" className="flex-1 justify-center">
              Google Docs
            </SegmentedControlItem>
          </SegmentedControl>
          <div key={format} className="rounded-md border border-border bg-background p-4 text-sm leading-relaxed animate-fade-in motion-reduce:animate-none">
            {format === "md" ? (
              <pre className="m-0 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">{`## 2. What we heard

Last year the website took 2,614 orders, 41% of the total[^1].

[^1]: Sales export 2025.xlsx, sheet "Orders by channel"`}</pre>
            ) : (
              <>
                <p className="m-0 font-serif text-lg font-medium">2. What we heard</p>
                <p className="m-0 mt-1 text-foreground">
                  Last year the website took 2,614 orders, 41% of the total<sup className="text-[0.7em]">{format === "gdoc" ? "[1]" : "1"}</sup>.
                </p>
                <p className="m-0 mt-3 border-t border-border pt-2 text-xs text-muted-foreground">
                  <sup>1</sup> Sales export 2025.xlsx, sheet “Orders by channel”
                  {format === "pdf" ? <span className="float-right tabular-nums">Page 2 of 4</span> : null}
                </p>
              </>
            )}
          </div>
          <p className="m-0 text-sm text-muted-foreground">{notes[format]}</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <DialogClose className={buttonVariants({ variant: "secondary" })}>Cancel</DialogClose>
          <DialogClose value="download" className={buttonVariants({ variant: "primary" })}>
            <DownloadIcon />
            Download
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
