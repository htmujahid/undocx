"use client";

import {
  Tooltip,
  TooltipContent as TooltipContentPrimitive,
  TooltipTrigger,
} from "@ui-sdk/react/tooltip";
import type { ComponentProps } from "react";
import { cn } from "~@/lib/utils";

function TooltipContent({ className, ...props }: ComponentProps<typeof TooltipContentPrimitive>) {
  return (
    <TooltipContentPrimitive
      sideOffset={6}
      className={cn(
        "z-50 rounded-md bg-foreground px-2 py-1 font-sans text-xs text-background shadow-sm origin-(--transform-origin) transition-[opacity,scale] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 data-instant:transition-none motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export { Tooltip, TooltipContent, TooltipTrigger };
