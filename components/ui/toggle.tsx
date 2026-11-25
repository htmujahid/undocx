"use client";

import { Toggle as TogglePrimitive, ToggleGroup as ToggleGroupPrimitive } from "@ui-sdk/react/toggle";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "~@/lib/utils";

function Toggle({ className, ...props }: Omit<ComponentProps<typeof TogglePrimitive>, "children"> & { children?: ReactNode }) {
  return (
    <TogglePrimitive
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md border border-input bg-card px-2.5 text-sm text-foreground transition-colors outline-none select-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-pressed:border-primary data-pressed:bg-primary/10 data-pressed:text-primary-deep data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function ToggleGroup({ className, ...props }: Omit<ComponentProps<typeof ToggleGroupPrimitive>, "children"> & { children?: ReactNode }) {
  return <ToggleGroupPrimitive className={cn("inline-flex items-center gap-0.5", className)} {...props} />;
}

export { Toggle, ToggleGroup };
