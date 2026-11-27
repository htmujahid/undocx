"use client";

import { Button } from "~@/components/ui/button";
import { ArrowUpIcon, CheckIcon, RefreshCwIcon } from "~@/components/ui/icons";
import { SidebarContent, SidebarFooter } from "~@/components/ui/sidebar";
import { Toggle } from "~@/components/ui/toggle";

type Message = { from: "you" | "undocx"; text: string; actions?: string[]; isFlag?: boolean; time?: string };

const focus = "§2 ¶2";
const placeholder = "Tell it what to change in §2 ¶2…";
const thread: Message[] = [
  { from: "you", time: "9:25", text: "Lead with the customer, not the checkout." },
  { from: "undocx", text: "Rewrote ¶2 to open with the customer's experience. Kept the two numbers and their citations. Nothing else changed.", actions: ["Keep", "Undo", "Show diff"] },
  { from: "undocx", isFlag: true, text: "¶4 quotes Priya but there is no source behind “one in five phone orders”. Attach a note, mark it as an estimate, or cut it?", actions: ["Mark as estimate", "Cut it"] },
];

export function AssistantTab() {
  return (
    <>
      <SidebarContent className="px-4 py-4">
        <p className="m-0 mb-4 text-xs text-muted-foreground">Working on {focus}</p>
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
    </>
  );
}
