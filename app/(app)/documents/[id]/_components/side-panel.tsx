"use client";

import { Sidebar, SidebarHeader, SidebarRail } from "~@/components/ui/sidebar";
import { Tabs, TabsList, TabsPanel, TabsTab } from "~@/components/ui/tabs";
import { AssistantTab } from "./assistant-tab";
import { NotesTab } from "./notes-tab";
import { OutlineTab } from "./outline-tab";
import { useNotes } from "~@/editor/extensions/notes";
import { usePanel, type PanelTab } from "~@/editor/extensions/panel";
import type { proposal } from "./proposal";

export function SidePanel({ doc }: { doc: typeof proposal }) {
  const { tab, setTab } = usePanel();
  const saved = useNotes().notes.filter((note) => !note.isDraft);
  return (
    <Sidebar side="right" aria-label="Document panel">
      <Tabs value={tab} onValueChange={(next) => setTab(next as PanelTab)} className="flex h-full min-h-0 flex-1 flex-col">
        <SidebarHeader className="h-14 flex-row items-center border-b border-sidebar-border px-4 py-0">
          <TabsList aria-label="Panel" className="h-full">
            <TabsTab value="outline">Outline</TabsTab>
            <TabsTab value="assistant">Assistant</TabsTab>
            <TabsTab value="notes">
              Notes
              {saved.length > 0 ? <span className="rounded-sm bg-sidebar-accent px-1 font-sans text-[0.65rem] tracking-normal text-muted-foreground tabular-nums">{saved.length}</span> : null}
            </TabsTab>
          </TabsList>
        </SidebarHeader>
        <TabsPanel value="outline" className="flex min-h-0 flex-1 flex-col">
          <OutlineTab doc={doc} />
        </TabsPanel>
        <TabsPanel value="assistant" className="flex min-h-0 flex-1 flex-col">
          <AssistantTab />
        </TabsPanel>
        <TabsPanel value="notes" className="flex min-h-0 flex-1 flex-col">
          <NotesTab />
        </TabsPanel>
      </Tabs>
      <SidebarRail />
    </Sidebar>
  );
}
