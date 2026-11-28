import { cache, Suspense } from "react";
import { listChatThreads } from "./actions";
import { ChatShell } from "./_components/chat-shell";

const loadThreads = cache(async () => listChatThreads());

async function Shell({ children }: Pick<LayoutProps<"/chat">, "children">) {
  return <ChatShell initial={await loadThreads()}>{children}</ChatShell>;
}

export default function ChatLayout({ children }: LayoutProps<"/chat">) {
  return (
    <Suspense fallback={<div role="status" aria-label="Loading" className="h-full" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
