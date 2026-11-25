"use client";

import {
  Dialog,
  DialogBackdrop as DialogBackdropPrimitive,
  DialogClose,
  DialogContent as DialogContentPrimitive,
  DialogDescription as DialogDescriptionPrimitive,
  DialogTitle as DialogTitlePrimitive,
  DialogTrigger,
} from "@ui-sdk/react/dialog";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "~@/lib/utils";

function DialogBackdrop({ className, ...props }: ComponentProps<typeof DialogBackdropPrimitive>) {
  return (
    <DialogBackdropPrimitive
      className={cn("fixed inset-0 bg-foreground/40 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none", className)}
      {...props}
    />
  );
}

function DialogContent({ className, ...props }: Omit<ComponentProps<typeof DialogContentPrimitive>, "children"> & { children?: ReactNode }) {
  return (
    <DialogContentPrimitive
      className={cn(
        "fixed top-1/2 left-1/2 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-0 text-foreground shadow-lg outline-none transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: ComponentProps<typeof DialogTitlePrimitive>) {
  return <DialogTitlePrimitive className={cn("m-0 font-serif text-2xl font-medium tracking-tight", className)} {...props} />;
}

function DialogDescription({ className, ...props }: ComponentProps<typeof DialogDescriptionPrimitive>) {
  return <DialogDescriptionPrimitive className={cn("m-0 text-sm text-muted-foreground", className)} {...props} />;
}

export { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger };
