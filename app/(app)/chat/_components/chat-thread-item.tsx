"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { DotsThreeIcon, TrashIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "~@/components/ui/menu";
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, useSidebar } from "~@/components/ui/sidebar";
import type { ChatThreadSummary } from "../query";
import { DeleteChatDialog } from "./delete-chat-dialog";

export function ChatThreadItem({ thread }: { thread: ChatThreadSummary }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [isDeleting, setIsDeleting] = useState(false);
  const href = `/chat/${thread.id}`;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={pathname === href} render={<Link href={href} onClick={() => isMobile && setOpenMobile(false)} />}>
        <span className="truncate">{thread.title}</span>
      </SidebarMenuButton>
      <Menu onAction={(action) => action === "delete" && setIsDeleting(true)}>
        <MenuTrigger render={<SidebarMenuAction showOnHover aria-label={`Actions for ${thread.title}`} />}>
          <DotsThreeIcon />
        </MenuTrigger>
        <MenuContent align="start" className="min-w-40">
          <MenuItem value="delete" icon={<TrashIcon />} destructive>
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>
      <DeleteChatDialog id={thread.id} title={thread.title} open={isDeleting} onOpenChange={setIsDeleting} onDeleted={() => pathname === href && router.push("/chat")} />
    </SidebarMenuItem>
  );
}
