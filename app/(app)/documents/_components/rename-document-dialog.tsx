"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { InputField } from "~@/components/ui/form-fields";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { documentLimits } from "~@/lib/documents/limits";
import { titleSchema, type TitleValues } from "~@/lib/documents/schemas";
import { useUpdateTitle } from "../query";

export function RenameDialog({ id, title, open, onOpenChange }: { id: string; title: string; open: boolean; onOpenChange: (open: boolean) => void }) {
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
