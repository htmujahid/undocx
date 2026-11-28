"use client";

import { buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { XIcon } from "~@/components/ui/icons";
import type { CreatedSource } from "~@/lib/sources/actions";
import { AddSourcePanels } from "./add-source-panels";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId?: string;
  onAdded: (source: CreatedSource) => void;
};

export function AddSourceDialog({ open, onOpenChange, documentId, onAdded }: Props) {
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
        <AddSourcePanels documentId={documentId} onAdded={handleAdded} className="p-5" />
      </DialogContent>
    </Dialog>
  );
}
