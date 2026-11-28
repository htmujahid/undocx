"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { InputField } from "~@/components/ui/form-fields";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { organizeLimits } from "~@/lib/documents/limits";
import { folderSchema, type FolderValues } from "~@/lib/documents/schemas";
import { useCreateFolder, useRenameFolder } from "../query";

export function FolderDialog({ folder, open, onOpenChange }: { folder?: { id: string; name: string }; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { trigger: create } = useCreateFolder();
  const { trigger: rename } = useRenameFolder(folder?.id ?? "");
  const form = useForm<FolderValues>({ resolver: zodResolver(folderSchema), values: { name: folder?.name ?? "" } });
  const { isSubmitting, errors } = form.formState;
  const submit = form.handleSubmit(async (values) => {
    const result = folder ? await rename(values) : await create(values);
    if (result?.error) {
      form.setError("root.server", { message: result.error });
      return;
    }
    form.reset({ name: "" });
    onOpenChange(false);
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <form onSubmit={submit} noValidate>
          <div className="grid gap-4 p-5">
            <div className="grid gap-2">
              <DialogTitle>{folder ? "Rename folder" : "New folder"}</DialogTitle>
              <DialogDescription>Folders group your documents. A document sits in one folder at a time.</DialogDescription>
            </div>
            <InputField control={form.control} name="name" label="Name" max={organizeLimits.folderName} autoFocus onFocus={(event) => event.currentTarget.select()} />
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
              {folder ? "Rename" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
