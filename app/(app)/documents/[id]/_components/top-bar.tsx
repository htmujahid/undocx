"use client";

import Link from "next/link";
import { SidebarTrigger } from "~@/components/ui/sidebar";
import { ExportDialog } from "./export-dialog";

export function TopBar({ id, title }: { id: string; title: string }) {
  return (
    <header className="@container sticky top-0 flex h-14 shrink-0 items-center gap-4 bg-background px-4 shadow-[inset_0_-1px_0_var(--border)] sm:px-6">
      <div className="flex shrink-0 items-center gap-3 @3xl:w-64">
        <Link href="/documents" className="shrink-0 font-serif text-xl leading-none font-medium tracking-tight text-foreground no-underline">
          Undocx<span className="text-primary">.</span>
        </Link>
      </div>

      <h1 className="m-0 min-w-0 flex-1 truncate text-center text-[0.9375rem] leading-none font-medium text-foreground" title={id}>
        {title}
      </h1>

      <div className="flex shrink-0 items-center justify-end gap-3 @3xl:w-64">
        <ExportDialog />
        <span aria-hidden="true" className="h-5 w-px bg-border lg:hidden" />
        <SidebarTrigger className="-scale-x-100 lg:hidden" />
      </div>
    </header>
  );
}
