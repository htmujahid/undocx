"use client";

import { Toolbar as ToolbarPrimitive, ToolbarButton as ToolbarButtonPrimitive, ToolbarGroup, ToolbarInput, ToolbarSeparator as ToolbarSeparatorPrimitive } from "@ui-sdk/react/toolbar";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "~@/lib/utils";

function Toolbar({ className, ...props }: Omit<ComponentProps<typeof ToolbarPrimitive>, "children"> & { children?: ReactNode }) {
  return <ToolbarPrimitive className={cn("flex items-center gap-1", className)} {...props} />;
}

function ToolbarButton({ className, ...props }: Omit<ComponentProps<typeof ToolbarButtonPrimitive>, "children"> & { children?: ReactNode }) {
  return (
    <ToolbarButtonPrimitive
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md px-2 text-sm text-foreground outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring data-disabled:opacity-40 [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ToolbarSeparator({ className, ...props }: ComponentProps<typeof ToolbarSeparatorPrimitive>) {
  return <ToolbarSeparatorPrimitive className={cn("mx-1 h-5 w-px bg-border", className)} {...props} />;
}

export { Toolbar, ToolbarButton, ToolbarGroup, ToolbarInput, ToolbarSeparator };
