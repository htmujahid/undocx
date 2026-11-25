"use client";

import { Tabs as TabsPrimitive, TabsList as TabsListPrimitive, TabsPanel as TabsPanelPrimitive, TabsTab as TabsTabPrimitive } from "@ui-sdk/react/tabs";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "~@/lib/utils";

type WithChildren<T> = Omit<T, "children"> & { children?: ReactNode };

function Tabs({ className, ...props }: WithChildren<ComponentProps<typeof TabsPrimitive>>) {
  return <TabsPrimitive className={cn("flex min-h-0 flex-col", className)} {...props} />;
}

function TabsList({ className, ...props }: WithChildren<ComponentProps<typeof TabsListPrimitive>>) {
  return <TabsListPrimitive className={cn("flex shrink-0 items-stretch gap-4", className)} {...props} />;
}

function TabsTab({ className, ...props }: WithChildren<ComponentProps<typeof TabsTabPrimitive>>) {
  return (
    <TabsTabPrimitive
      className={cn(
        "relative inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase outline-none transition-colors select-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring data-selected:text-foreground data-selected:after:absolute data-selected:after:inset-x-0 data-selected:after:-bottom-px data-selected:after:h-px data-selected:after:bg-primary data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function TabsPanel({ className, ...props }: WithChildren<ComponentProps<typeof TabsPanelPrimitive>>) {
  return <TabsPanelPrimitive className={cn("outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring", className)} {...props} />;
}

export { Tabs, TabsList, TabsPanel, TabsTab };
