import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { findChatThread, listChatMessages } from "~@/lib/db/repository/chat";
import { ChatPanel } from "../_components/chat-panel";

export const metadata: Metadata = {
  title: "Ask your documents",
  description: "Search everything you have written and get an answer with citations.",
};

async function Conversation({ params }: Pick<PageProps<"/chat/[id]">, "params">) {
  const user = await getCurrentUser();
  const { id } = await params;
  const thread = await findChatThread(user.id, id);
  const messages = thread ? await listChatMessages(thread.id) : [];
  if (!thread && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) notFound();
  return <ChatPanel key={id} threadId={id} title={thread?.title ?? null} initialMessages={messages} />;
}

export default function ChatThreadPage({ params }: PageProps<"/chat/[id]">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading" className="min-h-0 flex-1" />}>
      <Conversation params={params} />
    </Suspense>
  );
}
