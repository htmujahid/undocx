import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "~@/lib/auth/session";
import { listChatMessages } from "~@/lib/db/repository/chat";
import { DocumentsHeader } from "../documents/_components/documents-header";
import { ChatPanel } from "./_components/chat-panel";

export const metadata: Metadata = {
  title: "Ask your documents",
  description: "Search everything you have written and get an answer with citations.",
};

async function Conversation() {
  const user = await getCurrentUser();
  return <ChatPanel initialMessages={await listChatMessages(user.id)} />;
}

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <DocumentsHeader hasNewButton={false} />
      <Suspense fallback={<div role="status" aria-label="Loading" className="min-h-0 flex-1" />}>
        <Conversation />
      </Suspense>
    </div>
  );
}
