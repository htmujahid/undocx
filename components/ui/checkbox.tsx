"use client";

import { Checkbox as CheckboxPrimitive, CheckboxGroup, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import type { ComponentProps } from "react";
import { CheckIcon } from "~@/components/ui/icons";
import { cn } from "~@/lib/utils";

function Checkbox({ className, ...props }: Omit<ComponentProps<typeof CheckboxPrimitive>, "children">) {
  return (
    <CheckboxPrimitive
      className={cn(
        "grid size-4 shrink-0 cursor-pointer place-items-center rounded-[0.25rem] border border-input bg-card text-primary-foreground outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-checked:border-primary data-checked:bg-primary data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxIndicator>
        <CheckIcon aria-hidden="true" className="size-3" />
      </CheckboxIndicator>
    </CheckboxPrimitive>
  );
}

export { Checkbox, CheckboxGroup };
