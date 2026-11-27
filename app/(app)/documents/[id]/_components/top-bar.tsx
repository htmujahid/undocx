"use client";

import Link from "next/link";
import { SidebarTrigger } from "~@/components/ui/sidebar";
import type { SaveState } from "./document-saver";
import { ExportDialog } from "./export-dialog";
import { TitleField } from "./title-field";

const labels: Record<SaveState["kind"], string> = { saved: "Saved", unsaved: "Unsaved changes", saving: "Saving", error: "Not saved" };

export function TopBar({ id, title, saveState }: { id: string; title: string; saveState: SaveState }) {
  return (
    <header className="@container sticky top-0 flex h-14 shrink-0 items-center gap-4 bg-background px-4 shadow-[inset_0_-1px_0_var(--border)] sm:px-6">
      <div className="flex shrink-0 items-center gap-3 @3xl:w-64">
        <Link href="/documents" className="shrink-0 font-serif text-xl leading-none font-medium tracking-tight text-foreground no-underline">
          Undocx<span className="text-primary">.</span>
        </Link>
      </div>

      <TitleField id={id} title={title} />

      <div className="flex shrink-0 items-center justify-end gap-3 @3xl:w-64">
        <p aria-live="polite" title={saveState.kind === "error" ? saveState.message : undefined} className={saveState.kind === "error" ? "m-0 hidden text-xs text-destructive @xl:block" : "m-0 hidden text-xs text-muted-foreground @xl:block"}>
          {labels[saveState.kind]}
        </p>
        <ExportDialog />
        <span aria-hidden="true" className="h-5 w-px bg-border lg:hidden" />
        <SidebarTrigger className="-scale-x-100 lg:hidden" />
      </div>
    </header>
  );
}
