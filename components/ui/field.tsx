"use client";

import { Field, FieldDescription as FieldDescriptionPrimitive, FieldError as FieldErrorPrimitive, FieldLabel as FieldLabelPrimitive } from "@ui-sdk/react/field";
import type { ComponentProps } from "react";
import { cn } from "~@/lib/utils";

function FieldLabel({ className, ...props }: ComponentProps<typeof FieldLabelPrimitive>) {
  return <FieldLabelPrimitive className={cn("text-xs font-medium text-muted-foreground", className)} {...props} />;
}

function FieldDescription({ className, ...props }: ComponentProps<typeof FieldDescriptionPrimitive>) {
  return <FieldDescriptionPrimitive className={cn("text-xs text-muted-foreground", className)} {...props} />;
}

function FieldError({ className, ...props }: ComponentProps<typeof FieldErrorPrimitive>) {
  return <FieldErrorPrimitive className={cn("text-xs text-destructive", className)} {...props} />;
}

export { Field, FieldDescription, FieldError, FieldLabel };
