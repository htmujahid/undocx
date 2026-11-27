"use client";

import { Input as InputPrimitive } from "@ui-sdk/react/input";
import type { ComponentProps } from "react";
import { cn } from "~@/lib/utils";

function Input({ className, ...props }: ComponentProps<typeof InputPrimitive>) {
  return (
    <InputPrimitive
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-faint-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring data-disabled:opacity-50 data-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
