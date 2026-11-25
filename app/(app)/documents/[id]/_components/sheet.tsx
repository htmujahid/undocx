import type { ReactNode } from "react";
import { Button } from "~@/components/ui/button";
import { ColumnsIcon, Link2Icon, LockIcon, RefreshCwIcon } from "~@/components/ui/icons";
import { EditorToolbar } from "./editor-toolbar";

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

export function DocumentFrame({ status, children }: { status: ReactNode; children: ReactNode }) {
  return (
    <div data-scroller className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-muted/50">
      <EditorToolbar />
      <div className="px-4 py-8 lg:px-10">
        <article
          contentEditable
          suppressContentEditableWarning
          spellCheck
          aria-label="Document"
          className="mx-auto w-full max-w-[52rem] rounded-sm border border-border bg-card px-8 py-12 shadow-sm outline-none sm:px-14 sm:py-16"
        >
          {children}
        </article>
      </div>
      <footer className="sticky bottom-0 mt-auto flex h-9 shrink-0 items-center justify-between gap-4 bg-background px-4 text-xs text-muted-foreground shadow-[inset_0_1px_0_var(--border)]">
        {status}
        <span className="hidden font-mono text-faint-foreground sm:inline">Markdown</span>
        <span className="text-foreground">Autosaved</span>
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
