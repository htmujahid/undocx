"use client";

import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { useDeleteVersion, type VersionSummary } from "../versions/query";

export function VersionDeleteDialog({ documentId, version, onClose }: { documentId: string; version: VersionSummary; onClose: () => void }) {
  const { trigger, isMutating } = useDeleteVersion(documentId);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <div className="grid gap-2 p-5">
          <DialogTitle>Delete version {version.number}?</DialogTitle>
          <DialogDescription>Only this saved copy is deleted. Your document is not changed.</DialogDescription>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <DialogClose className={buttonVariants({ variant: "ghost" })}>Keep it</DialogClose>
          <Button
            variant="secondary"
            disabled={isMutating}
            className="text-destructive"
            onClick={async () => {
              await trigger(version.id);
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
