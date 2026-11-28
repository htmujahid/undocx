"use client";

import { useRouter } from "next/navigation";
import { relativeDay } from "~@/lib/format-date";
import { ListPane } from "../../library/_components/list-pane";
import { useChatThreads, useStartChat, type ChatThreadSummary } from "../query";

export function ChatPane({ initial }: { initial: ChatThreadSummary[] }) {
  const router = useRouter();
  const threads = useChatThreads(initial);
  const { trigger } = useStartChat();
  const items = threads.map((thread) => ({
    id: thread.id,
    href: `/chat/${thread.id}`,
    title: thread.title,
    meta: relativeDay(thread.updatedAt),
  }));
  return (
    <ListPane
      title="Chats"
      createLabel="New"
      createAction={async () => {
        const { id } = await trigger();
        router.push(`/chat/${id}`);
        return null;
      }}
      items={items}
      emptyText="No chats yet. Ask a question and it is saved here."
    />
  );
}
