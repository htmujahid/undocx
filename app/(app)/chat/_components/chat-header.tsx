"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~@/components/ui/button";
import { DotsThreeIcon, PlusIcon, TrashIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "~@/components/ui/menu";
import { SidebarTrigger } from "~@/components/ui/sidebar";
import { useStartChat } from "../query";
import { DeleteChatDialog } from "./delete-chat-dialog";

export function ChatHeader({ threadId, title, isSaved }: { threadId: string; title: string; isSaved: boolean }) {
  const router = useRouter();
  const { trigger: startChat, isMutating } = useStartChat();
  const [isDeleting, setIsDeleting] = useState(false);

  async function startNew() {
    const { id } = await startChat();
    router.push(`/chat/${id}`);
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-3 sm:px-4">
      <SidebarTrigger className="size-8" />
      <h1 className="m-0 min-w-0 flex-1 truncate text-base font-medium text-foreground">{title}</h1>
      <Button variant="ghost" size="icon" aria-label="New chat" disabled={isMutating} onClick={() => void startNew()}>
        <PlusIcon />
      </Button>
      {isSaved ? (
        <>
          <Menu onAction={(action) => action === "delete" && setIsDeleting(true)}>
            <MenuTrigger aria-label="Chat options" className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted">
              <DotsThreeIcon />
            </MenuTrigger>
            <MenuContent align="end" className="min-w-44">
              <MenuItem value="delete" icon={<TrashIcon />} destructive>
                Delete chat
              </MenuItem>
            </MenuContent>
          </Menu>
          <DeleteChatDialog id={threadId} title={title} open={isDeleting} onOpenChange={setIsDeleting} onDeleted={() => router.push("/chat")} />
        </>
      ) : null}
    </header>
  );
}
