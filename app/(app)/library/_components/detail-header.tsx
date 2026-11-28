"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Button } from "~@/components/ui/button";
import { ArrowLeftIcon, LoaderCircleIcon } from "~@/components/ui/icons";

type SaveStatus = { kind: "dirty" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string };

function statusOf<T extends FieldValues>(form: UseFormReturn<T>): SaveStatus {
  const { isDirty, isSubmitting, errors } = form.formState;
  const serverError = errors.root?.server?.message;
  if (isSubmitting) return { kind: "saving" };
  if (serverError) return { kind: "error", message: serverError };
  if (Object.keys(errors).some((key) => key !== "root")) return { kind: "error", message: "Fix the highlighted fields" };
  if (isDirty) return { kind: "dirty" };
  return { kind: "saved" };
}

function StatusText({ status }: { status: Extract<SaveStatus, { kind: "error" }> }) {
  return (
    <p role="alert" className="m-0 text-xs text-destructive">
      {status.message}
    </p>
  );
}

export function DetailTop<T extends FieldValues>({ backHref, backLabel, form, onSave, createLabel }: { backHref: string; backLabel: string; form: UseFormReturn<T>; onSave: () => void; createLabel?: string }) {
  const status = statusOf(form);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <Link href={backHref} className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground">
        <ArrowLeftIcon className="size-4" />
        {backLabel}
      </Link>
      <div className="ml-auto flex items-center gap-3">
        {status.kind === "error" ? <StatusText status={status} /> : null}
        <Button variant="primary" size="sm" disabled={createLabel ? form.formState.isSubmitting : !form.formState.isDirty || form.formState.isSubmitting} onClick={onSave}>
          {form.formState.isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
          {createLabel ?? "Save changes"}
        </Button>
      </div>
    </div>
  );
}

export function DetailBody({ children }: { children: ReactNode }) {
  return <div className="mx-auto grid w-full max-w-3xl flex-1 content-start gap-4 p-4 pb-10 sm:p-5 sm:pb-12">{children}</div>;
}

