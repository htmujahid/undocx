"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "~@/lib/utils";

export function SplitLayout({
  basePath,
  list,
  children,
}: {
  basePath: string;
  list: ReactNode;
  children: ReactNode;
}) {
  const isDetail = usePathname() !== basePath;
  return (
    <div className="flex h-full min-h-0">
      <aside
        aria-label="Items"
        className={cn(
          "relative min-h-0 w-full shrink-0 flex-col border-border bg-background lg:flex lg:w-80 lg:border-r",
          isDetail ? "hidden" : "flex",
        )}
      >
        {list}
      </aside>
      <main
        className={cn(
          "relative min-h-0 min-w-0 flex-1 overflow-y-auto bg-muted/30 lg:block",
          isDetail ? "block" : "hidden",
        )}
      >
        {children}
      </main>
    </div>
  );
}
