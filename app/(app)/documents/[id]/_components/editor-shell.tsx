"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Button } from "~@/components/ui/button";
import { UnfocusIcon } from "~@/components/ui/icons";
import { SidebarInset, SidebarProvider, useSidebar, type SidebarContextProps } from "~@/components/ui/sidebar";
import { PanelContext, type EditorNote, type PanelTab } from "./panel-context";
import { TopBar } from "./top-bar";

export type ShellState = { isSidebarOpen: boolean; isAssistantOpen: boolean; isFocus: boolean };

const OutlineSidebarContext = createContext<SidebarContextProps | null>(null);

export function useOutlineSidebar() {
  const context = useContext(OutlineSidebarContext);
  if (!context) throw new Error("useOutlineSidebar needs EditorShell");
  return context;
}

function CaptureOutlineSidebar({ children }: { children: ReactNode }) {
  const sidebar = useSidebar();
  return <OutlineSidebarContext value={sidebar}>{children}</OutlineSidebarContext>;
}

export function EditorShell({ id, title, notes: initialNotes, sidebar, assistant, children }: { id: string; title: string; notes: EditorNote[]; sidebar: ReactNode; assistant: ReactNode; children: ReactNode }) {
  const [shell, setState] = useState<ShellState>({ isSidebarOpen: true, isAssistantOpen: true, isFocus: false });
  const [tab, setTab] = useState<PanelTab>("assistant");
  const [notes, setNotes] = useState(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const setShell = (next: Partial<ShellState>) => setState((current) => ({ ...current, ...next }));
  const showNote = (id: string) => {
    setShell({ isAssistantOpen: true, isFocus: false });
    setTab("notes");
    setActiveNoteId(id);
  };
  const resolveNote = (id: string) => {
    setNotes((current) => current.filter((note) => note.id !== id));
    setActiveNoteId((current) => (current === id ? null : current));
  };

  return (
    <PanelContext value={{ isFocus: shell.isFocus, tab, setTab, notes, activeNoteId, showNote, resolveNote }}>
      <SidebarProvider
        open={shell.isSidebarOpen && !shell.isFocus}
        onOpenChange={(open) => setShell({ isSidebarOpen: open, isFocus: false })}
        cookieName="undocx_outline"
        shortcut="b"
        className="h-full min-h-0"
        data-focus={shell.isFocus || undefined}
      >
        <CaptureOutlineSidebar>
          {sidebar}
          <SidebarProvider
            open={shell.isAssistantOpen && !shell.isFocus}
            onOpenChange={(open) => setShell({ isAssistantOpen: open, isFocus: false })}
            cookieName="undocx_assistant"
            shortcut="j"
            className="h-full min-h-0 w-auto min-w-0 flex-1"
            style={{ "--sidebar-width": "22rem" } as React.CSSProperties}
          >
            <SidebarInset className="h-full min-h-0 min-w-0 overflow-hidden">
              {shell.isFocus ? (
                <div className="fixed top-3 right-3 z-20">
                  <Button size="sm" onClick={() => setShell({ isFocus: false })}>
                    <UnfocusIcon />
                    Leave focus
                  </Button>
                </div>
              ) : (
                <TopBar id={id} title={title} shell={shell} setShell={setShell} />
              )}
              {children}
            </SidebarInset>
            {assistant}
          </SidebarProvider>
        </CaptureOutlineSidebar>
      </SidebarProvider>
    </PanelContext>
  );
}
