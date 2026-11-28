"use client";

import { buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { XIcon } from "~@/components/ui/icons";
import { Tabs, TabsList, TabsPanel, TabsTab } from "~@/components/ui/tabs";
import type { CreatedSource } from "~@/lib/sources/actions";
import { UploadPanel } from "./upload-source-panel";
import { TextPanel } from "./text-source-panel";
import { LinkPanel } from "./link-source-panel";
import { LibraryPanel } from "./library-source-panel";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId?: string;
  onAdded: (source: CreatedSource) => void;
};

export function AddSourceDialog({ open, onOpenChange, documentId, onAdded }: Props) {
  const hasLibrary = Boolean(documentId);
  const handleAdded = (source: CreatedSource) => {
    onAdded(source);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent className="w-[min(34rem,calc(100vw-2rem))]">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="grid gap-1">
            <DialogTitle>Add a source</DialogTitle>
            <DialogDescription>Something Undocx can read and cite.</DialogDescription>
          </div>
          <DialogClose aria-label="Close" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <XIcon />
          </DialogClose>
        </div>
        <Tabs defaultValue={hasLibrary ? "library" : "upload"} className="grid gap-4 p-5">
          <TabsList aria-label="Source type">
            {hasLibrary ? <TabsTab value="library">Library</TabsTab> : null}
            <TabsTab value="upload">Upload</TabsTab>
            <TabsTab value="text">Paste text</TabsTab>
            <TabsTab value="link">Link</TabsTab>
          </TabsList>
          {hasLibrary && documentId ? (
            <TabsPanel value="library">
              <LibraryPanel documentId={documentId} onAdded={handleAdded} />
            </TabsPanel>
          ) : null}
          <TabsPanel value="upload">
            <UploadPanel documentId={documentId} onAdded={handleAdded} />
          </TabsPanel>
          <TabsPanel value="text">
            <TextPanel documentId={documentId} onAdded={handleAdded} />
          </TabsPanel>
          <TabsPanel value="link">
            <LinkPanel documentId={documentId} onAdded={handleAdded} />
          </TabsPanel>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
