"use client";

import {
  SegmentedControl as SegmentedControlPrimitive,
  SegmentedControlIndicator,
  SegmentedControlItem as SegmentedControlItemPrimitive,
} from "@ui-sdk/react/segmented-control";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "~@/lib/utils";

function SegmentedControl({
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof SegmentedControlPrimitive>, "children"> & { children?: ReactNode }) {
  return (
    <SegmentedControlPrimitive
      className={cn("relative isolate inline-flex h-8 items-center rounded-md bg-muted p-0.5", className)}
      {...props}
    >
      <SegmentedControlIndicator className="absolute -z-10 rounded-sm border border-input bg-card shadow-xs transition-[top,left,width,height] duration-200 ease-out data-[activation-direction=none]:transition-none motion-reduce:transition-none top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width)" />
      {children}
    </SegmentedControlPrimitive>
  );
}

function SegmentedControlItem({ className, ...props }: ComponentProps<typeof SegmentedControlItemPrimitive>) {
  return (
    <SegmentedControlItemPrimitive
      className={cn(
        "inline-flex h-full items-center rounded-sm px-2.5 text-[0.8125rem] font-medium text-muted-foreground transition-colors outline-none select-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring data-checked:text-foreground data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { SegmentedControl, SegmentedControlItem };
