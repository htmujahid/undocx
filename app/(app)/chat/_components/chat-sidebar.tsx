"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserMenu } from "~@/components/auth/user-menu";
import { FilesIcon, PlusIcon, ProfileIcon, SearchIcon } from "~@/components/ui/icons";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarSeparator, useSidebar } from "~@/components/ui/sidebar";
import { groupByDay } from "~@/lib/format-date";
import { useChatThreads, useStartChat, type ChatThreadSummary } from "../query";
import { ChatThreadItem } from "./chat-thread-item";

export function ChatSidebar({ initial }: { initial: ChatThreadSummary[] }) {
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const threads = useChatThreads(initial);
  const { trigger: startChat } = useStartChat();
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const shown = term ? threads.filter((thread) => thread.title.toLowerCase().includes(term)) : threads;
  const groups = groupByDay(shown, (thread) => thread.updatedAt);

  async function startNew() {
    const { id } = await startChat();
    if (isMobile) setOpenMobile(false);
    router.push(`/chat/${id}`);
  }

  return (
    <Sidebar collapsible="icon" aria-label="Chats">
      <SidebarHeader>
        <div className="flex h-9 items-center px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Link href="/documents" aria-label="Undocx" className="font-serif text-xl leading-none font-medium tracking-tight text-sidebar-foreground no-underline">
            U<span className="group-data-[collapsible=icon]:hidden">ndocx</span>
            <span className="text-primary">.</span>
          </Link>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="New chat" onClick={() => void startNew()}>
              <PlusIcon />
              <span>New chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Documents" render={<Link href="/documents" />}>
              <FilesIcon />
              <span>Documents</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Library" render={<Link href="/library/profiles" />}>
              <ProfileIcon />
              <span>Library</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <div className="px-2 pt-2 group-data-[collapsible=icon]:hidden">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-faint-foreground" />
            <SidebarInput type="search" aria-label="Search chats" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search chats" className="pl-8" />
          </div>
        </div>
        {groups.length === 0 ? (
          <p className="m-0 px-4 py-3 text-sm leading-normal text-muted-foreground group-data-[collapsible=icon]:hidden">{term ? `No chats match “${query.trim()}”.` : "No chats yet. Ask a question and it is saved here."}</p>
        ) : (
          groups.map((group) => (
            <SidebarGroup key={group.label} className="py-1 group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map((thread) => (
                  <ChatThreadItem key={thread.id} thread={thread} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu variant="sidebar" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
