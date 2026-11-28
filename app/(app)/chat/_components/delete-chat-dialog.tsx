"use client";

import { useTransition } from "react";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { useDeleteChatThread } from "../query";

export function DeleteChatDialog({ id, title, open, onOpenChange, onDeleted }: { id: string; title: string; open: boolean; onOpenChange: (open: boolean) => void; onDeleted: () => void }) {
  const { trigger } = useDeleteChatThread(id);
  const [isPending, startTransition] = useTransition();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <div className="grid gap-2 p-5">
          <DialogTitle>Delete this chat?</DialogTitle>
          <DialogDescription>“{title}” is deleted for good. Your documents are not affected.</DialogDescription>
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
                onDeleted();
              })
            }
          >
            {isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
            Delete chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
