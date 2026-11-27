"use client";

import { Textarea as TextareaPrimitive } from "@ui-sdk/react/textarea";
import type { ComponentProps } from "react";
import { cn } from "~@/lib/utils";

function Textarea({ className, ...props }: ComponentProps<typeof TextareaPrimitive>) {
  return (
    <TextareaPrimitive
      className={cn(
        "min-h-24 w-full min-w-0 resize-y rounded-md border border-input bg-card px-3 py-2 text-sm leading-normal text-foreground outline-none placeholder:text-faint-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring data-disabled:opacity-50 data-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
