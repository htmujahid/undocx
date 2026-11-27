"use client";

import { NumberInput, NumberInputControl as NumberInputControlPrimitive, NumberInputDecrement as NumberInputDecrementPrimitive, NumberInputGroup as NumberInputGroupPrimitive, NumberInputIncrement as NumberInputIncrementPrimitive } from "@ui-sdk/react/number-input";
import type { ComponentProps } from "react";
import { cn } from "~@/lib/utils";

const stepClass = "inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-disabled:opacity-40 [&_svg]:size-3.5";

function NumberInputGroup({ className, ...props }: ComponentProps<typeof NumberInputGroupPrimitive>) {
  return <NumberInputGroupPrimitive className={cn("flex h-8 w-full items-stretch overflow-hidden rounded-md border border-input bg-card focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ring", className)} {...props} />;
}

function NumberInputControl({ className, ...props }: ComponentProps<typeof NumberInputControlPrimitive>) {
  return <NumberInputControlPrimitive className={cn("min-w-0 flex-1 bg-transparent text-center text-sm text-foreground tabular-nums outline-none", className)} {...props} />;
}

function NumberInputDecrement({ className, ...props }: ComponentProps<typeof NumberInputDecrementPrimitive>) {
  return <NumberInputDecrementPrimitive className={cn(stepClass, "border-r border-input", className)} {...props} />;
}

function NumberInputIncrement({ className, ...props }: ComponentProps<typeof NumberInputIncrementPrimitive>) {
  return <NumberInputIncrementPrimitive className={cn(stepClass, "border-l border-input", className)} {...props} />;
}

export { NumberInput, NumberInputControl, NumberInputDecrement, NumberInputGroup, NumberInputIncrement };
