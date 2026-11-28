"use client";

import { LoaderCircleIcon } from "~@/components/ui/icons";

export function Working({ children }: { children: string }) {
  return (
    <p role="status" className="m-0 flex items-center gap-2 text-sm text-muted-foreground">
      <LoaderCircleIcon className="size-4 animate-spin" />
      {children}
    </p>
  );
}
