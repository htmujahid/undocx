"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { InputField } from "~@/components/ui/form-fields";
import { versionLimits } from "~@/lib/documents/limits";
import { versionNameSchema, type VersionNameValues } from "~@/lib/documents/schemas";
import { useRenameVersion, type VersionSummary } from "../versions/query";

export function VersionNameDialog({ documentId, version, onClose }: { documentId: string; version: VersionSummary; onClose: () => void }) {
  const { trigger } = useRenameVersion(documentId);
  const form = useForm<VersionNameValues>({ resolver: zodResolver(versionNameSchema), defaultValues: { name: version.name ?? "" } });
  const { isSubmitting, errors } = form.formState;
  const submit = form.handleSubmit(async (values) => {
    const result = await trigger({ id: version.id, values });
    if (result?.error) return form.setError("root.server", { message: result.error });
    onClose();
  });
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <form onSubmit={submit} noValidate>
          <div className="grid gap-4 p-5">
            <div className="grid gap-2">
              <DialogTitle>Name version {version.number}</DialogTitle>
              <DialogDescription>Leave it empty to show just the number.</DialogDescription>
            </div>
            <InputField control={form.control} name="name" label="Name" isLabelHidden max={versionLimits.name} autoFocus onFocus={(event) => event.currentTarget.select()} placeholder="Sent to Ruth" />
            {errors.root?.server ? (
              <p className="m-0 text-sm text-destructive" role="alert">
                {errors.root.server.message}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-4">
            <DialogClose className={buttonVariants({ variant: "ghost" })}>Cancel</DialogClose>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              Save name
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
