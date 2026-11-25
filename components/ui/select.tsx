"use client";

import {
  Select,
  SelectContent as SelectContentPrimitive,
  SelectItem as SelectItemPrimitive,
  SelectItemIcon as SelectItemIconPrimitive,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue,
  SelectValueIcon as SelectValueIconPrimitive,
} from "@ui-sdk/react/select";
import type { ComponentProps, ReactNode } from "react";
import { CheckIcon, ChevronDownIcon } from "~@/components/ui/icons";
import { cn } from "~@/lib/utils";

function SelectTrigger({ className, children, ...props }: Omit<ComponentProps<typeof SelectTriggerPrimitive>, "children"> & { children?: ReactNode }) {
  return (
    <SelectTriggerPrimitive
      className={cn(
        "inline-flex h-8 items-center justify-between gap-2 rounded-md px-2 text-sm text-foreground outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring data-open:bg-muted",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="size-3.5 text-muted-foreground" />
    </SelectTriggerPrimitive>
  );
}

function SelectContent({ className, ...props }: Omit<ComponentProps<typeof SelectContentPrimitive>, "children"> & { children?: ReactNode }) {
  return (
    <SelectContentPrimitive
      sideOffset={4}
      className={cn(
        "z-50 min-w-(--anchor-width) rounded-md border border-border bg-card p-1 shadow-md origin-(--transform-origin) transition-[opacity,scale] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function SelectValueIcon({ className, ...props }: ComponentProps<typeof SelectValueIconPrimitive>) {
  return <SelectValueIconPrimitive className={cn("inline-flex shrink-0 items-center text-muted-foreground [&_svg]:size-4", className)} {...props} />;
}

function SelectItem({ className, children, icon, ...props }: Omit<ComponentProps<typeof SelectItemPrimitive>, "children"> & { children?: ReactNode; icon?: ReactNode }) {
  return (
    <SelectItemPrimitive
      className={cn("flex cursor-default items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none data-highlighted:bg-muted data-selected:text-primary-deep", className)}
      {...props}
    >
      {icon ? <SelectItemIconPrimitive className="inline-flex shrink-0 items-center text-muted-foreground [&_svg]:size-4 in-data-selected:text-primary-deep">{icon}</SelectItemIconPrimitive> : null}
      <span className="flex-1">{children}</span>
      <SelectItemIndicator className="inline-flex shrink-0 items-center">
        <CheckIcon className="size-3.5" />
      </SelectItemIndicator>
    </SelectItemPrimitive>
  );
}

export { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectValueIcon };
