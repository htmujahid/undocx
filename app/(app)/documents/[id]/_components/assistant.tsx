"use client";

import { useEffect, useRef } from "react";
import { Button } from "~@/components/ui/button";
import { ArrowUpIcon, AssistantIcon, CheckIcon, NoteIcon, RefreshCwIcon } from "~@/components/ui/icons";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar } from "~@/components/ui/sidebar";
import { Tabs, TabsList, TabsPanel, TabsTab } from "~@/components/ui/tabs";
import { Toggle } from "~@/components/ui/toggle";
import { cn } from "~@/lib/utils";
import { usePanel, type EditorNote, type PanelTab } from "./panel-context";

type Message = { from: "you" | "undocx"; text: string; actions?: string[]; isFlag?: boolean; time?: string };

const focus = "§2 ¶2";
const placeholder = "Tell it what to change in §2 ¶2…";
const thread: Message[] = [
  { from: "you", time: "9:25", text: "Lead with the customer, not the checkout." },
  { from: "undocx", text: "Rewrote ¶2 to open with the customer's experience. Kept the two numbers and their citations. Nothing else changed.", actions: ["Keep", "Undo", "Show diff"] },
  { from: "undocx", isFlag: true, text: "¶4 quotes Priya but there is no source behind “one in five phone orders”. Attach a note, mark it as an estimate, or cut it?", actions: ["Mark as estimate", "Cut it"] },
];

export function AssistantSidebar() {
  const { isFocus, tab, setTab, notes } = usePanel();
  const { setOpen } = useSidebar();
  const show = (next: PanelTab) => {
    setTab(next);
    setOpen(true);
  };
  return (
    <Sidebar side="right" collapsible={isFocus ? "offcanvas" : "icon"} aria-label="Assistant">
      <div className="hidden h-full flex-col group-data-[collapsible=icon]:flex">
        <SidebarHeader className="h-14 justify-center border-b border-sidebar-border" />
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Assistant" isActive={tab === "assistant"} onClick={() => show("assistant")}>
                  <AssistantIcon />
                  <span>Assistant</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={notes.length > 0 ? `Notes (${notes.length})` : "Notes"} isActive={tab === "notes"} onClick={() => show("notes")}>
                  <NoteIcon />
                  <span>Notes</span>
                </SidebarMenuButton>
                {notes.length > 0 ? <span className="pointer-events-none absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary font-sans text-[0.6rem] leading-none text-primary-foreground tabular-nums">{notes.length}</span> : null}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </div>

      <Tabs value={tab} onValueChange={(next) => setTab(next as PanelTab)} className="flex h-full min-h-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
        <SidebarHeader className="h-14 flex-row items-center justify-between gap-3 border-b border-sidebar-border px-4 py-0">
          <TabsList aria-label="Panel" className="h-full">
            <TabsTab value="assistant">Assistant</TabsTab>
            <TabsTab value="notes">
              Notes
              {notes.length > 0 ? <span className="rounded-sm bg-sidebar-accent px-1 font-sans text-[0.65rem] tracking-normal text-muted-foreground tabular-nums">{notes.length}</span> : null}
            </TabsTab>
          </TabsList>
          <span className="truncate text-xs text-muted-foreground">Working on {focus}</span>
        </SidebarHeader>

        <TabsPanel value="assistant" className="flex min-h-0 flex-1 flex-col">
          <SidebarContent className="px-4 py-4">
            <ol className="m-0 grid list-none gap-5 p-0">
              {thread.map((message, index) =>
                message.from === "you" ? (
                  <li key={index} className="grid gap-1">
                    <span className="text-xs text-muted-foreground">You{message.time ? ` · ${message.time}` : ""}</span>
                    <p className="m-0 max-w-[90%] justify-self-end rounded-md bg-foreground px-3 py-2 text-sm text-background">{message.text}</p>
                  </li>
                ) : (
                  <li key={index} className="grid gap-2">
                    <span className="text-xs text-muted-foreground">Undocx</span>
                    <div className={"rounded-md border p-3 text-sm " + (message.isFlag ? "border-primary/40 bg-primary/5" : "border-border bg-card")}>
                      <p className="m-0 text-foreground">{message.text}</p>
                      {message.actions ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.actions.map((action, i) => (
                            <Button key={action} size="sm" variant={i === 0 ? (message.isFlag ? "secondary" : "primary") : "ghost"}>
                              {i === 0 && !message.isFlag ? <CheckIcon /> : null}
                              {action}
                            </Button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ),
              )}
            </ol>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-3">
            <p className="m-0 mb-1.5 font-mono text-[0.6rem] tracking-[0.15em] text-muted-foreground uppercase">Recent instructions</p>
            <div className="mb-2 flex flex-wrap gap-1.5" role="group" aria-label="Recent instructions">
              <Toggle className="h-7 text-xs">Lead with the customer</Toggle>
              <Toggle className="h-7 text-xs">Cut to half the length</Toggle>
              <Toggle className="h-7 text-xs">Plainer, for a non-technical reader</Toggle>
            </div>
            <form className="flex items-end gap-2 rounded-md border border-input bg-card p-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
              <label htmlFor="instruction" className="sr-only">
                Instruction for the selected paragraph
              </label>
              <textarea id="instruction" rows={2} placeholder={placeholder} className="min-w-0 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-faint-foreground" />
              <Button size="icon" variant="primary" aria-label="Send instruction" type="button">
                <ArrowUpIcon />
              </Button>
            </form>
            <p className="m-0 mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCwIcon className="size-3" />
              Changes only the paragraph you selected.
            </p>
          </SidebarFooter>
        </TabsPanel>

        <TabsPanel value="notes" className="flex min-h-0 flex-1 flex-col">
          <SidebarContent className="px-4 py-4">
            {notes.length > 0 ? (
              <ol className="m-0 grid list-none gap-3 p-0">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </ol>
            ) : (
              <p className="m-0 text-sm text-muted-foreground">No notes on this document.</p>
            )}
            <p className="m-0 mt-4 text-xs text-muted-foreground">Notes are yours alone. Select text and press ⌘⇧N, or use the margin, to add one.</p>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-3">
            <form className="flex items-end gap-2 rounded-md border border-input bg-card p-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
              <label htmlFor="new-note" className="sr-only">
                New note on the selected paragraph
              </label>
              <textarea id="new-note" rows={2} placeholder={`Note on ${focus}…`} className="min-w-0 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-faint-foreground" />
              <Button size="icon" variant="secondary" aria-label="Add note" type="button">
                <NoteIcon />
              </Button>
            </form>
          </SidebarFooter>
        </TabsPanel>
      </Tabs>
      <SidebarRail />
    </Sidebar>
  );
}

function NoteCard({ note }: { note: EditorNote }) {
  const { activeNoteId, resolveNote } = usePanel();
  const isActive = activeNoteId === note.id;
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (isActive) ref.current?.scrollIntoView({ block: "nearest" });
  }, [isActive]);
  return (
    <li ref={ref} className={cn("rounded-md border bg-card transition-colors", isActive ? "border-primary/60 shadow-[0_0_0_1px_var(--color-primary)]" : "border-border")}>
      <a href={note.href} className="block p-3 no-underline">
        <span className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <NoteIcon className="size-3 text-primary" />
            {note.where}
          </span>
          <span>{note.when}</span>
        </span>
        <span className="mt-2 block text-sm text-foreground">{note.text}</span>
      </a>
      <div className="flex justify-end border-t border-border px-2 py-1">
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => resolveNote(note.id)}>
          <CheckIcon />
          Resolve
        </Button>
      </div>
    </li>
  );
}
