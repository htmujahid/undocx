"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState, type ReactNode } from "react";
import { defaultPageSettings, marginPresets, paperSizes, setPageSettings, usePageSettings, type Layout, type MarginId, type Margins, type Orientation, type PaperId } from "~@/editor/extensions/page";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { Field, FieldLabel } from "~@/components/ui/field";
import { PageSetupIcon, XIcon } from "~@/components/ui/icons";
import { SegmentedControl, SegmentedControlItem } from "~@/components/ui/segmented-control";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";

const labelClass = "text-xs leading-4 font-medium text-muted-foreground";

function describe({ top, left }: Margins) {
  if (top === 0 && left === 0) return "0 mm";
  return top === left ? `${top} mm` : `${top} / ${left} mm`;
}

export function PageSetupDialog({ children }: { children: ReactNode }) {
  const [editor] = useLexicalComposerContext();
  const page = usePageSettings();
  const [open, setOpen] = useState(false);
  const isPageless = page.layout === "pageless";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger render={<Button size="sm" variant="ghost" aria-label="Page setup" onClick={() => setOpen(true)} className="h-6 gap-1.5 px-1.5 text-xs font-normal text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5" />}>
          <PageSetupIcon />
          {children}
        </TooltipTrigger>
        <TooltipContent>Page setup</TooltipContent>
      </Tooltip>
      <DialogBackdrop />
      <DialogContent className="w-[min(28rem,calc(100vw-2rem))]">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="grid gap-1">
            <DialogTitle>Page setup</DialogTitle>
            <DialogDescription>Layout, size and margins for this document.</DialogDescription>
          </div>
          <DialogClose aria-label="Close" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <XIcon />
          </DialogClose>
        </div>
        <div className="grid gap-5 p-5">
          <Field name="layout" className="grid content-start gap-1.5">
            <FieldLabel className={labelClass}>Layout</FieldLabel>
            <SegmentedControl value={page.layout} onValueChange={(next) => next && setPageSettings(editor, (current) => ({ ...current, layout: next as Layout }))} className="w-full">
              <SegmentedControlItem value="pageless" className="flex-1 justify-center">
                Pageless
              </SegmentedControlItem>
              <SegmentedControlItem value="pages" className="flex-1 justify-center">
                Pages
              </SegmentedControlItem>
            </SegmentedControl>
          </Field>
          {isPageless ? (
            <p className="m-0 text-sm text-muted-foreground">One continuous page that fits the window. Paper size and page breaks only apply to Pages.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid content-start gap-1.5">
                <Select value={page.paper} onValueChange={(next) => next && setPageSettings(editor, (current) => ({ ...current, paper: next as PaperId }))}>
                  <SelectLabel className={labelClass}>Paper size</SelectLabel>
                  <SelectTrigger className="w-full border border-input bg-card px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(paperSizes) as [PaperId, (typeof paperSizes)[PaperId]][]).map(([id, size]) => (
                      <SelectItem key={id} value={id} label={size.label}>
                        {size.label}
                        <span className="ml-2 font-mono text-[0.65rem] text-faint-foreground">
                          {size.width} × {size.height} mm
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field name="orientation" className="grid content-start gap-1.5">
                <FieldLabel className={labelClass}>Orientation</FieldLabel>
                <SegmentedControl value={page.orientation} onValueChange={(next) => next && setPageSettings(editor, (current) => ({ ...current, orientation: next as Orientation }))} className="w-full">
                  <SegmentedControlItem value="portrait" className="flex-1 justify-center">
                    Portrait
                  </SegmentedControlItem>
                  <SegmentedControlItem value="landscape" className="flex-1 justify-center">
                    Landscape
                  </SegmentedControlItem>
                </SegmentedControl>
              </Field>
            </div>
          )}
          <div className="grid content-start gap-1.5">
            <Select value={page.margins} onValueChange={(next) => next && setPageSettings(editor, (current) => ({ ...current, margins: next as MarginId }))}>
              <SelectLabel className={labelClass}>Margins</SelectLabel>
              <SelectTrigger className="w-full border border-input bg-card px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {marginPresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id} label={preset.label}>
                    {preset.label}
                    <span className="ml-2 font-mono text-[0.65rem] text-faint-foreground">{describe(preset.margins)}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between gap-2 border-t border-border p-4">
          <Button variant="ghost" onClick={() => setPageSettings(editor, () => defaultPageSettings)}>
            Reset
          </Button>
          <DialogClose className={buttonVariants({ variant: "primary" })}>Done</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
