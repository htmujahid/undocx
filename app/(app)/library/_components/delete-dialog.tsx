"use client";

import { useState, useTransition } from "react";
import { Button, buttonVariants } from "~@/components/ui/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~@/components/ui/dialog";
import { LoaderCircleIcon, TrashIcon } from "~@/components/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~@/components/ui/tooltip";

export function DeleteDialog({
  label,
  title,
  description,
  action,
}: {
  label: string;
  title: string;
  description: string;
  action: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={label}
              onClick={() => setOpen(true)}
              className="text-muted-foreground hover:text-destructive"
            />
          }
        >
          <TrashIcon />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <div className="grid gap-2 p-5">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <DialogClose className={buttonVariants({ variant: "ghost" })}>
            Keep it
          </DialogClose>
          <Button
            variant="secondary"
            disabled={isPending}
            onClick={() => startTransition(() => action())}
            className="text-destructive"
          >
            {isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
