"use client";

import { Radio as RadioPrimitive, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio";
import type { ComponentProps } from "react";
import { cn } from "~@/lib/utils";

function Radio({ className, ...props }: Omit<ComponentProps<typeof RadioPrimitive>, "children">) {
  return (
    <RadioPrimitive
      className={cn(
        "grid size-4 shrink-0 cursor-pointer place-items-center rounded-full border border-input bg-card outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-checked:border-primary data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioIndicator className="size-2 rounded-full bg-primary" />
    </RadioPrimitive>
  );
}

export { Radio, RadioGroup };
