"use client";

import {
  Combobox,
  ComboboxContent as ComboboxContentPrimitive,
  ComboboxEmpty as ComboboxEmptyPrimitive,
  ComboboxGroup,
  ComboboxGroupLabel as ComboboxGroupLabelPrimitive,
  ComboboxInput as ComboboxInputPrimitive,
  ComboboxItem as ComboboxItemPrimitive,
  ComboboxItemIcon as ComboboxItemIconPrimitive,
  ComboboxItemIndicator,
  ComboboxItemText as ComboboxItemTextPrimitive,
  ComboboxLabel,
  ComboboxList as ComboboxListPrimitive,
  ComboboxTrigger as ComboboxTriggerPrimitive,
  ComboboxValueIcon as ComboboxValueIconPrimitive,
} from "@ui-sdk/react/combobox";
import type { ComponentProps, ReactNode } from "react";
import { CheckIcon, ChevronDownIcon } from "~@/components/ui/icons";
import { cn } from "~@/lib/utils";

type WithChildren<T> = Omit<T, "children"> & { children?: ReactNode };

function ComboboxField({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-foreground hover:bg-muted focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ring has-data-open:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxInput({ className, ...props }: ComponentProps<typeof ComboboxInputPrimitive>) {
  return <ComboboxInputPrimitive className={cn("h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-faint-foreground", className)} {...props} />;
}

function ComboboxTrigger({ className, children, ...props }: WithChildren<ComponentProps<typeof ComboboxTriggerPrimitive>>) {
  return (
    <ComboboxTriggerPrimitive className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground", className)} {...props}>
      {children ?? <ChevronDownIcon className="size-3.5" />}
    </ComboboxTriggerPrimitive>
  );
}

function ComboboxValueIcon({ className, ...props }: ComponentProps<typeof ComboboxValueIconPrimitive>) {
  return <ComboboxValueIconPrimitive className={cn("inline-flex shrink-0 items-center text-muted-foreground [&_svg]:size-4", className)} {...props} />;
}

function ComboboxContent({ className, ...props }: WithChildren<ComponentProps<typeof ComboboxContentPrimitive>>) {
  return (
    <ComboboxContentPrimitive
      sideOffset={4}
      className={cn(
        "z-50 min-w-(--anchor-width) rounded-md border border-border bg-card p-1 shadow-md origin-(--transform-origin) transition-[opacity,scale] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxList({ className, ...props }: WithChildren<ComponentProps<typeof ComboboxListPrimitive>>) {
  return <ComboboxListPrimitive className={cn("max-h-72 overflow-y-auto", className)} {...props} />;
}

function ComboboxEmpty({ className, ...props }: ComponentProps<typeof ComboboxEmptyPrimitive>) {
  return <ComboboxEmptyPrimitive className={cn("hidden px-2 py-4 text-center text-sm text-muted-foreground data-empty:block", className)} {...props} />;
}

function ComboboxGroupLabel({ className, ...props }: ComponentProps<typeof ComboboxGroupLabelPrimitive>) {
  return <ComboboxGroupLabelPrimitive className={cn("px-2 pt-2 pb-1 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase", className)} {...props} />;
}

function ComboboxItem({ className, children, icon, ...props }: WithChildren<ComponentProps<typeof ComboboxItemPrimitive>> & { icon?: ReactNode }) {
  return (
    <ComboboxItemPrimitive
      className={cn("flex cursor-default items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none data-highlighted:bg-muted data-selected:text-primary-deep data-disabled:opacity-50", className)}
      {...props}
    >
      {icon ? <ComboboxItemIconPrimitive className="inline-flex shrink-0 items-center text-muted-foreground [&_svg]:size-4 in-data-selected:text-primary-deep">{icon}</ComboboxItemIconPrimitive> : null}
      <ComboboxItemTextPrimitive className="flex-1 [&_mark]:bg-transparent [&_mark]:font-semibold [&_mark]:text-foreground">{children}</ComboboxItemTextPrimitive>
      <ComboboxItemIndicator className="inline-flex shrink-0 items-center">
        <CheckIcon className="size-3.5" />
      </ComboboxItemIndicator>
    </ComboboxItemPrimitive>
  );
}

export { Combobox, ComboboxContent, ComboboxEmpty, ComboboxField, ComboboxGroup, ComboboxGroupLabel, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxTrigger, ComboboxValueIcon };
