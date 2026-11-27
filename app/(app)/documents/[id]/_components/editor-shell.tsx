"use client";

import type { UIMessage } from "@ai-sdk/react";
import { useState, type CSSProperties, type ReactNode } from "react";
import { usePanel } from "~@/editor/extensions/panel";
import { HistoryShortcuts } from "~@/editor/plugins/history-shortcuts";
import { SidebarInset, SidebarProvider } from "~@/components/ui/sidebar";
import { DocumentSaver, type SaveState } from "./document-saver";
import { NotesSync } from "./notes-sync";
import { CommandPalette } from "./command-palette";
import { SidePanel } from "./side-panel";
import { TopBar } from "./top-bar";

export function EditorShell({ id, title, version, messages, notes, children }: { id: string; title: string; version: number; messages: UIMessage[]; notes: { id: string; quote: string | null; text: string }[]; children: ReactNode }) {
  const { open, isFocus, setOpen } = usePanel();
  const [saveState, setSaveState] = useState<SaveState>({ kind: "saved" });

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
        {isFocus ? null : <TopBar id={id} title={title} saveState={saveState} />}
        {children}
      </SidebarInset>
      <SidePanel id={id} messages={messages} />
      <DocumentSaver id={id} version={version} onState={setSaveState} />
      <NotesSync id={id} initial={notes} />
      <CommandPalette />
      <HistoryShortcuts />
    </SidebarProvider>
  );
}
