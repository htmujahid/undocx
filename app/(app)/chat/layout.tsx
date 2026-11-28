import { cache, Suspense } from "react";
import { DocumentsHeader } from "../documents/_components/documents-header";
import { ListFallback } from "../library/_components/list-pane";
import { listChatThreads } from "./actions";
import { ChatHistoryDrawer } from "./_components/chat-history-drawer";
import { ChatPane } from "./_components/chat-pane";

const loadThreads = cache(async () => listChatThreads());

async function ThreadList() {
  return <ChatPane initial={await loadThreads()} />;
}

async function HistoryButton() {
  return <ChatHistoryDrawer initial={await loadThreads()} />;
}

export default function ChatLayout({ children }: LayoutProps<"/chat">) {
  return (
    <div className="flex h-full flex-col">
      <DocumentsHeader hasNewButton={false} />
      <div className="flex min-h-0 flex-1">
        <aside aria-label="Chat history" className="hidden w-72 shrink-0 flex-col border-r border-border bg-background lg:flex">
          <Suspense fallback={<ListFallback />}>
            <ThreadList />
          </Suspense>
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 justify-end border-b border-border px-4 py-1.5 lg:hidden">
            <Suspense fallback={null}>
              <HistoryButton />
            </Suspense>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
