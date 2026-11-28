"use client";

import { useState } from "react";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Drawer, DrawerBackdrop, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "~@/components/ui/drawer";
import { FilesIcon, XIcon } from "~@/components/ui/icons";
import type { ChatThreadSummary } from "../query";
import { ChatPane } from "./chat-pane";

export function ChatHistoryDrawer({ initial }: { initial: ChatThreadSummary[] }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Drawer side="left" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger render={<Button variant="ghost" size="sm" />}>
        <FilesIcon />
        Chat history
      </DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <div className="flex min-h-14 items-center justify-between border-b border-border px-5">
          <DrawerTitle>Chat history</DrawerTitle>
          <DrawerClose aria-label="Close" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <XIcon />
          </DrawerClose>
        </div>
        <DrawerDescription className="sr-only">Your earlier chats.</DrawerDescription>
        <div className="flex min-h-0 flex-1 flex-col" onClick={(event) => (event.target as HTMLElement).closest("a, button") && setIsOpen(false)}>
          <ChatPane initial={initial} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
