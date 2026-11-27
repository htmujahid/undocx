"use client";

import {
  Popover,
  PopoverClose,
  PopoverContent as PopoverContentPrimitive,
  PopoverDescription as PopoverDescriptionPrimitive,
  PopoverTitle as PopoverTitlePrimitive,
  PopoverTrigger,
} from "@ui-sdk/react/popover";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "~@/lib/utils";

function PopoverContent({ className, ...props }: Omit<ComponentProps<typeof PopoverContentPrimitive>, "children"> & { children?: ReactNode }) {
  return (
    <PopoverContentPrimitive
      sideOffset={6}
      className={cn(
        "z-50 w-72 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md origin-(--transform-origin) outline-none transition-[opacity,scale] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: ComponentProps<typeof PopoverTitlePrimitive>) {
  return <PopoverTitlePrimitive className={cn("m-0 text-sm font-medium text-foreground", className)} {...props} />;
}

function PopoverDescription({ className, ...props }: ComponentProps<typeof PopoverDescriptionPrimitive>) {
  return <PopoverDescriptionPrimitive className={cn("m-0 text-xs text-muted-foreground", className)} {...props} />;
}

export { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger };
