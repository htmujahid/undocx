"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePanel } from "~@/editor/extensions/panel";
import { HistoryShortcuts } from "~@/editor/plugins/history-shortcuts";
import { SidebarInset, SidebarProvider } from "~@/components/ui/sidebar";
import type { proposal } from "./proposal";
import { CommandPalette } from "./command-palette";
import { SidePanel } from "./side-panel";
import { TopBar } from "./top-bar";

export function EditorShell({ id, title, doc, children }: { id: string; title: string; doc: typeof proposal; children: ReactNode }) {
  const { open, isFocus, setOpen } = usePanel();

  return (
    <SidebarProvider
      open={open && !isFocus}
      onOpenChange={setOpen}
      cookieName="undocx_panel"
      shortcut="j"
      className="h-full min-h-0"
      style={{ "--sidebar-width": "22rem" } as CSSProperties}
      data-focus={isFocus || undefined}
    >
      <SidebarInset className="h-full min-h-0 min-w-0 overflow-hidden">
        {isFocus ? null : <TopBar id={id} title={title} />}
        {children}
      </SidebarInset>
      <SidePanel doc={doc} />
      <CommandPalette />
      <HistoryShortcuts />
    </SidebarProvider>
  );
}
