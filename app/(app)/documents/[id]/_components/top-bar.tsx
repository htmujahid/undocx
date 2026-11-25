"use client";

import Link from "next/link";
import { Button } from "~@/components/ui/button";
import { AssistantIcon, CheckIcon, FocusIcon, SidebarIcon, UnfocusIcon } from "~@/components/ui/icons";
import { SidebarTrigger } from "~@/components/ui/sidebar";
import { Toggle } from "~@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";
import { useOutlineSidebar, type ShellState } from "./editor-shell";
import { ExportDialog } from "./export-dialog";

const quiet = "size-8 justify-center border-0 bg-transparent px-0 text-muted-foreground data-pressed:bg-transparent data-pressed:text-foreground";

export function TopBar({ id, title, shell, setShell }: { id: string; title: string; shell: ShellState; setShell: (next: Partial<ShellState>) => void }) {
  const outline = useOutlineSidebar();
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-4 shadow-[inset_0_-1px_0_var(--border)]">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Outline and sources" className="size-8 md:hidden" onClick={() => outline.toggleSidebar()}>
          <SidebarIcon />
        </Button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
          <Link href="/documents" className="hidden shrink-0 text-muted-foreground no-underline hover:text-foreground sm:inline">
            Documents
          </Link>
          <span aria-hidden="true" className="hidden text-faint-foreground sm:inline">
            /
          </span>
          <p className="m-0 truncate font-medium text-foreground" title={id}>
            {title}
          </p>
        </nav>
        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
          <CheckIcon className="size-3" />
          Saved
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger render={<Toggle aria-label={shell.isFocus ? "Leave focus mode" : "Focus mode"} pressed={shell.isFocus} onPressedChange={(v) => setShell({ isFocus: v })} className={quiet} />}>
            {shell.isFocus ? <UnfocusIcon /> : <FocusIcon />}
          </TooltipTrigger>
          <TooltipContent>Focus mode</TooltipContent>
        </Tooltip>
        <span aria-hidden="true" className="h-5 w-px bg-border" />
        <ExportDialog />
        <SidebarTrigger aria-label="Assistant and notes" className="size-8 md:hidden">
          <AssistantIcon />
        </SidebarTrigger>
      </div>
    </header>
  );
}
