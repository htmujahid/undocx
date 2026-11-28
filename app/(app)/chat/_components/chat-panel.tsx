"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef } from "react";
import { useSWRConfig } from "swr";
import { Button } from "~@/components/ui/button";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { chatLimits, type ChatMetadata } from "~@/lib/chat/schemas";
import { chatThreadsKey, searchStatusKey } from "../query";
import { Answer } from "./chat-answer";
import { ChatComposer } from "./chat-composer";
import { ChatHeader } from "./chat-header";
import { SearchStatus } from "./search-status";
import { SourceList } from "./chat-sources";

const starters = ["Which document mentions a deadline?", "What have I written about pricing?", "Find where I describe our refund policy"];

function errorText(error: Error) {
  try {
    const parsed = JSON.parse(error.message) as { error?: unknown };
    if (typeof parsed.error === "string") return parsed.error;
  } catch {}
  return error.message.startsWith("<") ? "Something went wrong. Try again." : error.message;
}

function textOf(message: UIMessage) {
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
}

export function ChatPanel({ threadId, title, initialMessages }: { threadId: string; title: string | null; initialMessages: UIMessage[] }) {
  const { mutate } = useSWRConfig();
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/chat/ask",
        prepareSendMessagesRequest: ({ messages }) => ({ body: { message: { text: textOf(messages[messages.length - 1]) }, threadId } }),
      }),
    [threadId],
  );
  const { messages, sendMessage, status, error, stop, clearError } = useChat({ id: threadId, messages: initialMessages, transport, onFinish: () => {
      void mutate(chatThreadsKey);
      void mutate(searchStatusKey);
    },
  });
  const endRef = useRef<HTMLDivElement>(null);
  const isBusy = status === "submitted" || status === "streaming";
  const heading = title ?? (messages[0] ? textOf(messages[0]).slice(0, chatLimits.title) : "New chat");

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  async function send(text: string) {
    clearError();
    await sendMessage({ text });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatHeader threadId={threadId} title={heading} isSaved={messages.length > 0} />

      {messages.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-4 pb-16">
          <div className="grid gap-2 text-center">
            <h2 className="m-0 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">What would you like to know?</h2>
            <p className="m-0 text-base leading-normal text-muted-foreground">Ask anything about your documents. Every answer comes with its sources.</p>
          </div>
          <div className="grid w-full max-w-3xl gap-2">
            <ChatComposer onSend={send} onStop={stop} isBusy={isBusy} autoFocus />
            <SearchStatus isBusy={isBusy} />
          </div>
          <div className="flex max-w-3xl flex-wrap justify-center gap-2">
            {starters.map((starter) => (
              <Button key={starter} size="sm" variant="secondary" className="rounded-full" disabled={isBusy} onClick={() => void send(starter)}>
                {starter}
              </Button>
            ))}
          </div>
          {error ? (
            <p className="m-0 max-w-3xl rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
              {errorText(error)}
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ol className="mx-auto m-0 grid w-full max-w-3xl list-none gap-8 p-0 px-4 py-6">
              {messages.map((message) => {
                const text = textOf(message);
                const sources = (message.metadata as ChatMetadata | undefined)?.sources ?? [];
                return message.role === "user" ? (
                  <li key={message.id} className="flex justify-end">
                    <p className="m-0 max-w-[85%] rounded-lg bg-muted px-4 py-2.5 text-base leading-normal whitespace-pre-wrap text-foreground">{text}</p>
                  </li>
                ) : (
                  <li key={message.id} className="grid gap-3 text-base leading-relaxed">
                    {text ? <Answer text={text} sources={sources} /> : <p className="m-0 text-muted-foreground">…</p>}
                    <SourceList sources={sources} text={text} />
                  </li>
                );
              })}
              {status === "submitted" ? (
                <li className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  Searching your documents
                </li>
              ) : null}
              {error ? (
                <li>
                  <p className="m-0 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
                    {errorText(error)}
                  </p>
                </li>
              ) : null}
            </ol>
            <div ref={endRef} />
          </div>
          <div className="shrink-0 px-4 pb-4">
            <div className="mx-auto grid w-full max-w-3xl gap-2">
              <ChatComposer onSend={send} onStop={stop} isBusy={isBusy} />
              <SearchStatus isBusy={isBusy} />
              <p className="m-0 text-center text-xs text-faint-foreground">Answers come from your own documents and can miss things. Check the sources.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
