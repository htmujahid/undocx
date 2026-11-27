"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode } from "@lexical/rich-text";
import { $getRoot } from "lexical";
import { useState } from "react";
import { downloadFile, exportDocument, exportFormats, slugify } from "~@/editor/export-formats";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "~@/components/ui/dialog";
import { DownloadIcon, XIcon } from "~@/components/ui/icons";
import { Select, SelectContent, SelectGroup, SelectGroupLabel, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~@/components/ui/select";

const ready = exportFormats.filter((format) => format.status === "ready");
const soon = exportFormats.filter((format) => format.status === "soon");

export function ExportDialog() {
  const [editor] = useLexicalComposerContext();
  const [formatId, setFormatId] = useState(ready[0].id);
  const format = exportFormats.find((option) => option.id === formatId) ?? ready[0];

  async function download() {
    const title = editor.read(() => {
      const first = $getRoot().getFirstChild();
      return $isHeadingNode(first) ? first.getTextContent() : "document";
    });
    downloadFile(`${slugify(title)}.${format.extension}`, await exportDocument(editor, format), format.mime);
  }

  return (
    <Dialog>
      <DialogTrigger shortcut="mod+e" render={<Button size="sm" variant="primary" />}>
        <DownloadIcon />
        Export
      </DialogTrigger>
      <DialogBackdrop />
      <DialogContent className="w-[min(28rem,calc(100vw-2rem))]">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="grid gap-1">
            <DialogTitle>Export</DialogTitle>
            <DialogDescription>Choose a format to download this document.</DialogDescription>
          </div>
          <DialogClose aria-label="Close" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <XIcon />
          </DialogClose>
        </div>
        <div className="grid gap-4 p-5">
          <Select value={formatId} onValueChange={(next) => next && setFormatId(next)}>
            <SelectLabel className="text-xs font-medium text-muted-foreground">Format</SelectLabel>
            <SelectTrigger className="w-full border border-input bg-card px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectGroupLabel>Available</SelectGroupLabel>
                {ready.map((option) => (
                  <SelectItem key={option.id} value={option.id} label={option.label}>
                    {option.label}
                    <span className="ml-2 font-mono text-[0.65rem] text-faint-foreground">.{option.extension}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectGroupLabel>Coming soon</SelectGroupLabel>
                {soon.map((option) => (
                  <SelectItem key={option.id} value={option.id} label={option.label} disabled>
                    {option.label}
                    <span className="ml-2 font-mono text-[0.65rem] text-faint-foreground">.{option.extension}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="m-0 text-sm text-muted-foreground">{format.description}</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <DialogClose className={buttonVariants({ variant: "secondary" })}>Cancel</DialogClose>
          <DialogClose value="download" action={download} className={buttonVariants({ variant: "primary" })}>
            <DownloadIcon />
            Download .{format.extension}
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
