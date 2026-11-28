"use client";

import { useTransition } from "react";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { useDeleteFolder } from "../query";

export function DeleteFolderDialog({ id, name, open, onOpenChange }: { id: string; name: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { trigger } = useDeleteFolder(id);
  const [isPending, startTransition] = useTransition();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <div className="grid gap-2 p-5">
          <DialogTitle>Delete the folder “{name}”?</DialogTitle>
          <DialogDescription>The documents in it are not deleted. They move to Unfiled.</DialogDescription>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <DialogClose className={buttonVariants({ variant: "ghost" })}>Keep it</DialogClose>
          <Button
            variant="secondary"
            disabled={isPending}
            className="text-destructive"
            onClick={() =>
              startTransition(async () => {
                await trigger();
                onOpenChange(false);
              })
            }
          >
            {isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
            Delete folder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
