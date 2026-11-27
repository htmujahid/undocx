"use client";

import { Switch as SwitchPrimitive, SwitchThumb } from "@ui-sdk/react/switch";
import type { ComponentProps } from "react";
import { cn } from "~@/lib/utils";

function Switch({ className, ...props }: Omit<ComponentProps<typeof SwitchPrimitive>, "children">) {
  return (
    <SwitchPrimitive
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-input transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-checked:bg-primary data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchThumb className="block size-4 translate-x-0.5 rounded-full bg-card shadow-xs transition-transform data-checked:translate-x-[1.1rem]" />
    </SwitchPrimitive>
  );
}

export { Switch };
