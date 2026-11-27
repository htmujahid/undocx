"use client";

import { Sidebar, SidebarHeader, SidebarRail } from "~@/components/ui/sidebar";
import { Tabs, TabsList, TabsPanel, TabsTab } from "~@/components/ui/tabs";
import type { UIMessage } from "@ai-sdk/react";
import { AssistantTab } from "./assistant-tab";
import { NotesTab } from "./notes-tab";
import { ChecksTab } from "./checks-tab";
import { VersionsTab } from "./versions-tab";
import { OutlineTab } from "./outline-tab";
import { useNotes } from "~@/editor/extensions/notes";
import { usePanel, type PanelTab } from "~@/editor/extensions/panel";

export function SidePanel({ id, messages }: { id: string; messages: UIMessage[] }) {
  const { tab, setTab } = usePanel();
  const saved = useNotes().notes.filter((note) => !note.isDraft);
  return (
    <Sidebar side="right" aria-label="Document panel">
      <Tabs value={tab} onValueChange={(next) => setTab(next as PanelTab)} className="flex h-full min-h-0 flex-1 flex-col">
        <SidebarHeader className="h-14 flex-row items-center border-b border-sidebar-border px-4 py-0">
          <TabsList aria-label="Panel" className="h-full gap-3 [&_[role=tab]]:tracking-[0.08em]">
            <TabsTab value="outline">Outline</TabsTab>
            <TabsTab value="assistant">Assistant</TabsTab>
            <TabsTab value="versions">Versions</TabsTab>
            <TabsTab value="checks">Checks</TabsTab>
            <TabsTab value="notes">
              Notes
              {saved.length > 0 ? <span className="rounded-sm bg-sidebar-accent px-1 font-sans text-[0.65rem] tracking-normal text-muted-foreground tabular-nums">{saved.length}</span> : null}
            </TabsTab>
          </TabsList>
        </SidebarHeader>
        <TabsPanel value="outline" className="flex min-h-0 flex-1 flex-col">
          <OutlineTab documentId={id} />
        </TabsPanel>
        <TabsPanel value="assistant" className="flex min-h-0 flex-1 flex-col">
          <AssistantTab id={id} initialMessages={messages} />
        </TabsPanel>
        <TabsPanel value="versions" className="flex min-h-0 flex-1 flex-col">
          <VersionsTab documentId={id} />
        </TabsPanel>
        <TabsPanel value="checks" className="flex min-h-0 flex-1 flex-col">
          <ChecksTab documentId={id} />
        </TabsPanel>
        <TabsPanel value="notes" className="flex min-h-0 flex-1 flex-col">
          <NotesTab />
        </TabsPanel>
      </Tabs>
      <SidebarRail />
    </Sidebar>
  );
}
