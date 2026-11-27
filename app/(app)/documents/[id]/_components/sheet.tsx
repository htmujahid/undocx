import type { ReactNode } from "react";
import { Button } from "~@/components/ui/button";
import { CheckIcon, ColumnsIcon, Link2Icon, LockIcon, RefreshCwIcon } from "~@/components/ui/icons";
import { EditorContent } from "~@/editor/editor";
import { PageInfo } from "~@/editor/plugins/page-info";
import { EditorToolbar } from "./editor-toolbar";
import { FocusToggle } from "./focus-toggle";
import { PageSetupDialog } from "./page-setup-dialog";

export { Para } from "./para";

export function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 text-[0.65em] text-primary" contentEditable={false}>
      {n}
    </sup>
  );
}

export function SectionHeading({ n, children }: { n: string; children: ReactNode }) {
  return (
    <h2 id={`s${n}`} data-section={n} className="m-0 mb-2 scroll-mt-16 font-serif text-2xl font-medium tracking-tight text-foreground">
      {n}. {children}
    </h2>
  );
}

export function SelectionBubble() {
  return (
    <span role="toolbar" aria-label="Selection" contentEditable={false} className="absolute -top-11 left-0 flex items-center gap-0.5 rounded-md border border-border bg-card p-1 shadow-md">
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary-deep">
        <RefreshCwIcon />
        Regenerate
      </Button>
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
        <ColumnsIcon />
        Variations
      </Button>
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
        <LockIcon />
        Lock
      </Button>
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
        <Link2Icon />
        Cite
      </Button>
    </span>
  );
}

export function DocumentFrame() {
  return (
    <div data-scroller className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-muted/50">
      <EditorToolbar />
      <EditorContent />
      <footer className="sticky bottom-0 left-0 mt-auto flex h-9 shrink-0 items-center justify-between gap-4 bg-background px-4 text-xs text-muted-foreground shadow-[inset_0_1px_0_var(--border)]">
        <span className="flex items-center gap-2">
          <PageSetupDialog>
            <span className="hidden sm:inline">
              <PageInfo />
            </span>
          </PageSetupDialog>
        </span>
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-foreground">
            <CheckIcon className="size-3 text-primary" />
            Autosaved
          </span>
          <span aria-hidden="true" className="h-3.5 w-px bg-border" />
          <FocusToggle />
        </span>
      </footer>
    </div>
  );
}

export function TypingPrompt() {
  return (
    <div className="-mx-3 rounded-md px-3 py-1">
      <p className="m-0 text-doc text-faint-foreground" contentEditable={false}>
        Type here, or press <kbd className="rounded-sm border border-input bg-card px-1 font-sans text-xs text-foreground">⌘R</kbd> to let Undocx draft the next paragraph.
      </p>
    </div>
  );
}
