"use client";

import type { CSSProperties, ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "~@/components/ui/sidebar";
import type { ChatThreadSummary } from "../query";
import { ChatSidebar } from "./chat-sidebar";

export function ChatShell({ initial, children }: { initial: ChatThreadSummary[]; children: ReactNode }) {
  return (
    <SidebarProvider cookieName="undocx_chat_sidebar" className="h-full min-h-0" style={{ "--sidebar-width": "17rem" } as CSSProperties}>
      <ChatSidebar initial={initial} />
      <SidebarInset className="h-full min-h-0 min-w-0 overflow-hidden">{children}</SidebarInset>
    </SidebarProvider>
  );
}
