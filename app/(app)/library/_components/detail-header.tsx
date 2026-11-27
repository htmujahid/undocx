"use client";

import Link from "next/link";
import { Button } from "~@/components/ui/button";
import type { ReactNode } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  LoaderCircleIcon,
} from "~@/components/ui/icons";
import { cn } from "~@/lib/utils";
import type { FieldValues, UseFormReturn } from "react-hook-form";

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

function StatusText({ status }: { status: SaveStatus }) {
  return (
    <p
      aria-live="polite"
      className={cn(
        "m-0 flex items-center gap-1.5 text-xs whitespace-nowrap",
        status.kind === "error" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {status.kind === "saving" ? (
        <LoaderCircleIcon className="size-3.5 animate-spin" />
      ) : null}
      {status.kind === "saved" ? (
        <CheckIcon className="size-3.5 text-primary" />
      ) : null}
      {status.kind === "dirty"
          ? "Unsaved changes"
          : status.kind === "saving"
            ? "Saving"
            : status.kind === "saved"
              ? "Saved"
              : status.message}
    </p>
  );
}

export function DetailHeader<T extends FieldValues>({
  backHref,
  eyebrow,
  title,
  form,
  onSave,
  children,
}: {
  backHref: string;
  eyebrow: string;
  title: string;
  form: UseFormReturn<T>;
  onSave: () => void;
  children?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <Link
        href={backHref}
        aria-label="Back to the list"
        className="-ml-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted lg:hidden"
      >
        <ArrowLeftIcon />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="m-0 font-mono text-[0.6rem] tracking-[0.15em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h1 className="m-0 truncate font-serif text-lg leading-tight font-medium text-foreground">
          {title}
        </h1>
      </div>
      <StatusText status={statusOf(form)} />
      {children}
      <Button
        variant="primary"
        size="sm"
        disabled={!form.formState.isDirty || form.formState.isSubmitting}
        onClick={onSave}
      >
        {form.formState.isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
        Save changes
      </Button>
    </header>
  );
}
