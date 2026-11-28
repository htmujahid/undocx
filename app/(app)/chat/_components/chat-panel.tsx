"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import { Button } from "~@/components/ui/button";
import { DeleteDialog } from "~@/components/delete-dialog";
import { ArrowUpIcon, LoaderCircleIcon, PlusIcon } from "~@/components/ui/icons";
import { chatLimits, chatMessageSchema, type ChatMessageValues, type ChatMetadata } from "~@/lib/chat/schemas";
import { chatThreadsKey, useDeleteChatThread, useStartChat } from "../query";
import { Answer } from "./chat-answer";
import { SourceList } from "./chat-sources";

const starters = ["Which document mentions a deadline?", "What have I written about pricing?", "Find where I describe our refund policy"];

function textOf(message: UIMessage) {
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
}

export function ChatPanel({ threadId, title, initialMessages }: { threadId: string; title: string | null; initialMessages: UIMessage[] }) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/chat/ask",
        prepareSendMessagesRequest: ({ messages }) => ({ body: { message: { text: textOf(messages[messages.length - 1]) }, threadId } }),
      }),
    [threadId],
  );
  const { messages, sendMessage, status, error, clearError } = useChat({ id: threadId, messages: initialMessages, transport, onFinish: () => void mutate(chatThreadsKey) });
  const heading = title ?? (messages[0] ? textOf(messages[0]).slice(0, chatLimits.title) : "Ask your documents.");
  const { trigger: startChat, isMutating: isStarting } = useStartChat();
  const { trigger: remove } = useDeleteChatThread(threadId);
  const form = useForm<ChatMessageValues>({ resolver: zodResolver(chatMessageSchema), defaultValues: { text: "" } });
  const endRef = useRef<HTMLDivElement>(null);
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  const send = form.handleSubmit(async ({ text }) => {
    form.reset();
    clearError();
    await sendMessage({ text });
  });

  async function ask(text: string) {
    clearError();
    await sendMessage({ text });
  }

  async function startNew() {
    const { id } = await startChat();
    router.push(`/chat/${id}`);
  }

  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-2xl gap-6 px-4 py-10 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">Chat</p>
              <h1 className="m-0 mt-1 truncate font-serif text-3xl font-medium tracking-tight text-foreground">{heading}</h1>
            </div>
            {messages.length > 0 ? (
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="sm" disabled={isStarting || isBusy} onClick={() => void startNew()}>
                  <PlusIcon />
                  New chat
                </Button>
                <DeleteDialog
                  label="Delete this chat"
                  title="Delete this chat?"
                  description="The conversation is deleted for good. Your documents are not affected."
                  action={async () => {
                    await remove();
                    router.push("/chat");
                  }}
                />
              </div>
            ) : null}
          </div>

          {messages.length === 0 ? (
            <div className="grid gap-3">
              <p className="m-0 text-sm leading-normal text-muted-foreground">Ask anything about what you have written. Undocx finds the passages that matter across all your documents and answers from them, with a citation for each claim.</p>
              <div className="flex flex-wrap gap-2">
                {starters.map((starter) => (
                  <Button key={starter} size="sm" variant="secondary" disabled={isBusy} onClick={() => void ask(starter)}>
                    {starter}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <ol className="m-0 grid list-none gap-5 p-0">
              {messages.map((message) => {
                const text = textOf(message);
                const sources = (message.metadata as ChatMetadata | undefined)?.sources ?? [];
                return message.role === "user" ? (
                  <li key={message.id} className="grid gap-1">
                    <span className="text-xs text-muted-foreground">You</span>
                    <p className="m-0 max-w-[90%] justify-self-end rounded-md bg-foreground px-3 py-2 text-sm whitespace-pre-wrap text-background">{text}</p>
                  </li>
                ) : (
                  <li key={message.id} className="grid gap-2">
                    <span className="text-xs text-muted-foreground">Undocx</span>
                    <div className="grid gap-3 rounded-md border border-border bg-card p-3 text-sm">{text ? <Answer text={text} sources={sources} /> : <p className="m-0 text-muted-foreground">…</p>}</div>
                    <SourceList sources={sources} text={text} />
                  </li>
                );
              })}
              {status === "submitted" ? (
                <li className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
                  <LoaderCircleIcon className="size-3.5 animate-spin" />
                  Searching your documents
                </li>
              ) : null}
            </ol>
          )}
          {error ? (
            <p className="m-0 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
              {error.message}
            </p>
          ) : null}
          <div ref={endRef} />
        </div>
      </main>
      <footer className="shrink-0 border-t border-border bg-background p-3">
        <form onSubmit={send} noValidate className="mx-auto flex w-full max-w-2xl items-end gap-2 rounded-md border border-input bg-card p-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
          <label htmlFor="chat-message" className="sr-only">
            Question about your documents
          </label>
          <textarea
            id="chat-message"
            rows={2}
            placeholder="Ask about your documents…"
            className="min-w-0 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-faint-foreground"
            {...form.register("text")}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
          />
          <Button type="submit" size="icon" variant="primary" aria-label="Send" disabled={isBusy}>
            {isBusy ? <LoaderCircleIcon className="animate-spin" /> : <ArrowUpIcon />}
          </Button>
        </form>
        {form.formState.errors.text ? (
          <p className="m-0 mx-auto mt-2 max-w-2xl text-xs text-destructive" role="alert">
            {form.formState.errors.text.message}
          </p>
        ) : null}
      </footer>
    </>
  );
}
