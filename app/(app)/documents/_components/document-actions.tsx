"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { InputField } from "~@/components/ui/form-fields";
import { CheckIcon, DotsThreeIcon, LoaderCircleIcon, PencilSimpleIcon, TrashIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
import { documentLimits } from "~@/lib/documents/limits";
import { titleSchema, type DocumentStatus, type TitleValues } from "~@/lib/documents/schemas";
import { useDeleteDocument, useSetDocumentStatus, useUpdateTitle } from "../query";

function RenameDialog({ id, title, open, onOpenChange }: { id: string; title: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { trigger } = useUpdateTitle(id);
  const form = useForm<TitleValues>({ resolver: zodResolver(titleSchema), values: { title } });
  const { isSubmitting, errors } = form.formState;
  const submit = form.handleSubmit(async (values) => {
    const result = await trigger(values);
    if (result?.error) {
      form.setError("root.server", { message: result.error });
      return;
    }
    onOpenChange(false);
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <form onSubmit={submit} noValidate>
          <div className="grid gap-4 p-5">
            <div className="grid gap-2">
              <DialogTitle>Rename document</DialogTitle>
              <DialogDescription>Only you see the title.</DialogDescription>
            </div>
            <InputField control={form.control} name="title" label="Title" max={documentLimits.title} autoFocus onFocus={(event) => event.currentTarget.select()} />
            {errors.root?.server ? (
              <p className="m-0 text-sm text-destructive" role="alert">
                {errors.root.server.message}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-4">
            <DialogClose className={buttonVariants({ variant: "ghost" })}>Cancel</DialogClose>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
              Rename
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDocumentDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (open: boolean) => void }) {
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

export function DocumentActions({ id, title, status }: { id: string; title: string; status: DocumentStatus | "drafting" }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { trigger: setStatus } = useSetDocumentStatus(id);
  const next: DocumentStatus = status === "ready" ? "draft" : "ready";
  const isDrafting = status === "drafting";
  return (
    <>
      <Menu
        onAction={(action) => {
          if (action === "rename") setIsRenaming(true);
          if (action === "status") void setStatus(next);
          if (action === "delete") setIsDeleting(true);
        }}
      >
        <MenuTrigger aria-label={`Actions for ${title}`} className="relative z-10 flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted">
          <DotsThreeIcon className="size-4" />
        </MenuTrigger>
        <MenuContent align="end" className="min-w-48">
          <MenuItem value="rename" icon={<PencilSimpleIcon />}>
            Rename
          </MenuItem>
          {isDrafting ? null : (
            <MenuItem value="status" icon={<CheckIcon />}>
              {status === "ready" ? "Back to draft" : "Mark ready to send"}
            </MenuItem>
          )}
          <MenuSeparator />
          <MenuItem value="delete" icon={<TrashIcon />} destructive>
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>
      <RenameDialog id={id} title={title} open={isRenaming} onOpenChange={setIsRenaming} />
      <DeleteDocumentDialog id={id} open={isDeleting} onOpenChange={setIsDeleting} />
    </>
  );
}
