"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { DotsThreeIcon, LoaderCircleIcon, TrashIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";

export type ExtraAction = { value: string; label: string; icon?: ReactNode; run: () => Promise<unknown> | void };

export function LibraryItemMenu({
  label,
  extra = [],
  deleteTitle,
  deleteDescription,
  onDelete,
}: {
  label: string;
  extra?: ExtraAction[];
  deleteTitle: string;
  deleteDescription: string;
  onDelete: () => Promise<unknown>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <Menu
        onAction={(action) => {
          if (action === "delete") setIsDeleting(true);
          else void extra.find((item) => item.value === action)?.run();
        }}
      >
        <MenuTrigger aria-label={`Actions for ${label}`} className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted">
          <DotsThreeIcon className="size-4" />
        </MenuTrigger>
        <MenuContent align="end" className="min-w-48">
          {extra.map((item) => (
            <MenuItem key={item.value} value={item.value} icon={item.icon}>
              {item.label}
            </MenuItem>
          ))}
          {extra.length > 0 ? <MenuSeparator /> : null}
          <MenuItem value="delete" icon={<TrashIcon />} destructive>
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogBackdrop />
        <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
          <div className="grid gap-2 p-5">
            <DialogTitle>{deleteTitle}</DialogTitle>
            <DialogDescription>{deleteDescription}</DialogDescription>
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-4">
            <DialogClose className={buttonVariants({ variant: "ghost" })}>Keep it</DialogClose>
            <Button
              variant="secondary"
              disabled={isPending}
              className="text-destructive"
              onClick={() =>
                startTransition(async () => {
                  await onDelete();
                  setIsDeleting(false);
                })
              }
            >
              {isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
