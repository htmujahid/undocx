"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DefaultChatTransport } from "ai";
import { $getRoot } from "lexical";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~@/components/ui/button";
import { ArrowUpIcon, LoaderCircleIcon, RefreshCwIcon, XIcon } from "~@/components/ui/icons";
import { SidebarContent, SidebarFooter } from "~@/components/ui/sidebar";
import { assistantMessageSchema, type AssistantMessageValues } from "~@/lib/ai/schemas";
import { useAiEdits } from "~@/editor/extensions/ai-edits";
import { useClearAssistant } from "../query";
import { AssistantEdits } from "./assistant-edits";

const starters = ["Summarise what this document says so far", "Suggest a stronger opening", "What is missing for the reader to decide?"];

function textOf(message: UIMessage) {
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
}

export function AssistantTab({ id, initialMessages }: { id: string; initialMessages: UIMessage[] }) {
  const [editor] = useLexicalComposerContext();
  const { focus, setFocus } = useAiEdits();
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/documents/${id}/assistant`,
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: { message: { text: textOf(messages[messages.length - 1]) }, document: editor.read(() => $getRoot().getTextContent()), focus: typeof body?.focus === "string" ? body.focus : null },
        }),
      }),
    [id, editor],
  );
  const { messages, sendMessage, setMessages, status, error, stop, clearError } = useChat({ id, messages: initialMessages, transport });
  const { trigger: clear, isMutating: isClearing } = useClearAssistant(id);
  const form = useForm<AssistantMessageValues>({ resolver: zodResolver(assistantMessageSchema), defaultValues: { text: "" } });
  const endRef = useRef<HTMLDivElement>(null);
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  const send = form.handleSubmit(async ({ text }) => {
    form.reset();
    clearError();
    await sendMessage({ text }, { body: { focus } });
    setFocus(null);
  });

  async function ask(text: string) {
    clearError();
    await sendMessage({ text }, { body: { focus } });
  }

  useEffect(() => {
    if (focus) document.getElementById("assistant-message")?.focus();
  }, [focus]);

  async function startOver() {
    stop();
    await clear();
    setMessages([]);
    clearError();
  }

  return (
    <>
      <SidebarContent className="px-4 py-4">
        <AssistantEdits />
        {messages.length === 0 ? (
          <div className="grid gap-3">
            <p className="m-0 text-sm text-muted-foreground">Ask about this document. Undocx reads what you have written, and follows your profile, voice and rules when the document uses them.</p>
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
            {messages.map((message) =>
              message.role === "user" ? (
                <li key={message.id} className="grid gap-1">
                  <span className="text-xs text-muted-foreground">You</span>
                  <p className="m-0 max-w-[90%] justify-self-end rounded-md bg-foreground px-3 py-2 text-sm whitespace-pre-wrap text-background">{textOf(message)}</p>
                </li>
              ) : (
                <li key={message.id} className="grid gap-2">
                  <span className="text-xs text-muted-foreground">Undocx</span>
                  <div className="rounded-md border border-border bg-card p-3 text-sm">
                    <p className="m-0 whitespace-pre-wrap text-foreground">{textOf(message) || "…"}</p>
                  </div>
                </li>
              ),
            )}
            {status === "submitted" ? (
              <li className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
                <LoaderCircleIcon className="size-3.5 animate-spin" />
                Thinking
              </li>
            ) : null}
          </ol>
        )}
        {error ? (
          <p className="m-0 mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
            {error.message}
          </p>
        ) : null}
        <div ref={endRef} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {focus ? (
          <div className="mb-2 flex items-start justify-between gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            <p className="m-0 line-clamp-2">
              Asking about <span className="text-foreground">“{focus}”</span>
            </p>
            <Button size="icon" variant="ghost" aria-label="Stop asking about this passage" className="-mt-1 -mr-1 size-6" onClick={() => setFocus(null)}>
              <XIcon className="size-3" />
            </Button>
          </div>
        ) : null}
        <form onSubmit={send} noValidate className="flex items-end gap-2 rounded-md border border-input bg-card p-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
          <label htmlFor="assistant-message" className="sr-only">
            Message for Undocx
          </label>
          <textarea
            id="assistant-message"
            rows={2}
            placeholder="Ask Undocx about this document…"
            className="min-w-0 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-faint-foreground"
            {...form.register("text")}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (!isBusy) void send();
              }
            }}
          />
          {isBusy ? (
            <Button size="icon" variant="secondary" aria-label="Stop" type="button" onClick={() => void stop()}>
              <XIcon />
            </Button>
          ) : (
            <Button size="icon" variant="primary" aria-label="Send message" type="submit">
              <ArrowUpIcon />
            </Button>
          )}
        </form>
        {form.formState.errors.text ? (
          <p className="m-0 mt-1.5 text-xs text-destructive" role="alert">
            {form.formState.errors.text.message}
          </p>
        ) : null}
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>It reads your document but does not change it yet.</span>
          {messages.length > 0 ? (
            <Button size="sm" variant="ghost" disabled={isClearing} onClick={() => void startOver()}>
              <RefreshCwIcon className="size-3" />
              Start over
            </Button>
          ) : null}
        </div>
      </SidebarFooter>
    </>
  );
}
