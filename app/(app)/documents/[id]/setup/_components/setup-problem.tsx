"use client";

import { Button } from "~@/components/ui/button";

export function Problem({ message, onRetry, children }: { message: string; onRetry: () => void; children?: React.ReactNode }) {
  return (
    <div className="grid gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4" role="alert">
      <p className="m-0 text-sm text-destructive">{message}</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
        {children}
      </div>
    </div>
  );
}
