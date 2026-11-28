"use client";

import { useTransition } from "react";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { useDeleteDocument } from "../query";

export function DeleteDocumentDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { trigger } = useDeleteDocument(id);
  const [isPending, startTransition] = useTransition();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <div className="grid gap-2 p-5">
          <DialogTitle>Delete this document?</DialogTitle>
          <DialogDescription>Its text, notes, saved versions and assistant conversation are deleted with it. Sources stay in your library. This cannot be undone.</DialogDescription>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <DialogClose className={buttonVariants({ variant: "ghost" })}>Keep it</DialogClose>
          <Button variant="secondary" disabled={isPending} onClick={() => startTransition(async () => void (await trigger()))} className="text-destructive">
            {isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
