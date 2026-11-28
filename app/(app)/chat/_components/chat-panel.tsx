"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~@/components/ui/button";
import { ArrowUpIcon, LoaderCircleIcon, RefreshCwIcon } from "~@/components/ui/icons";
import { chatMessageSchema, type ChatMessageValues, type ChatMetadata, type ChatSource } from "~@/lib/chat/schemas";
import { clearConversation } from "../actions";

const starters = ["Which document mentions a deadline?", "What have I written about pricing?", "Find where I describe our refund policy"];

const transport = new DefaultChatTransport({
  api: "/chat/ask",
  prepareSendMessagesRequest: ({ messages }) => ({ body: { message: { text: textOf(messages[messages.length - 1]) } } }),
});

function textOf(message: UIMessage) {
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
}

function Answer({ text, sources }: { text: string; sources: ChatSource[] }) {
  const parts = text.replace(/\*\*|__/g, "").split(/(\[\d+\])/g);
  return (
    <p className="m-0 whitespace-pre-wrap text-foreground">
      {parts.map((part, index) => {
        const match = /^\[(\d+)\]$/.exec(part);
        const source = match ? sources.find((item) => item.n === Number(match[1])) : undefined;
        if (!source) return <Fragment key={index}>{part}</Fragment>;
        return (
          <Link key={index} href={`/documents/${source.documentId}`} aria-label={`Source ${source.n}: ${source.title}`} className="mx-0.5 align-super text-[0.65rem] font-medium text-primary no-underline hover:underline">
            [{source.n}]
          </Link>
        );
      })}
    </p>
  );
}

function SourceList({ sources, text }: { sources: ChatSource[]; text: string }) {
  const cited = sources.filter((source) => text.includes(`[${source.n}]`));
  if (cited.length === 0) return null;
  return (
    <ol className="m-0 grid list-none gap-2 p-0">
      {cited.map((source) => (
        <li key={source.n} className="grid gap-1 rounded-md border border-border bg-background p-3">
          <Link href={`/documents/${source.documentId}`} className="flex items-baseline gap-2 text-xs font-medium text-foreground no-underline hover:underline">
            <span className="font-mono text-primary">[{source.n}]</span>
            <span className="truncate">{source.title}</span>
            {source.section ? <span className="truncate font-normal text-muted-foreground">{source.section}</span> : null}
          </Link>
          <p className="m-0 line-clamp-3 text-xs leading-normal text-muted-foreground">{source.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function ChatPanel({ initialMessages }: { initialMessages: UIMessage[] }) {
  const { messages, sendMessage, setMessages, status, error, stop, clearError } = useChat({ id: "library-chat", messages: initialMessages, transport });
  const form = useForm<ChatMessageValues>({ resolver: zodResolver(chatMessageSchema), defaultValues: { text: "" } });
  const [isClearing, setIsClearing] = useState(false);
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

  async function startOver() {
    stop();
    setIsClearing(true);
    await clearConversation();
    setMessages([]);
    clearError();
    setIsClearing(false);
  }

  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-2xl gap-6 px-4 py-10 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="m-0 font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">Chat</p>
              <h1 className="m-0 mt-1 font-serif text-3xl font-medium tracking-tight text-foreground">Ask your documents.</h1>
            </div>
            {messages.length > 0 ? (
              <Button variant="ghost" size="sm" disabled={isClearing || isBusy} onClick={() => void startOver()}>
                <RefreshCwIcon />
                New chat
              </Button>
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
