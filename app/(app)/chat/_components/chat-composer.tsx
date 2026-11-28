"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~@/components/ui/button";
import { ArrowUpIcon, StopIcon } from "~@/components/ui/icons";
import { chatMessageSchema, type ChatMessageValues } from "~@/lib/chat/schemas";

export function ChatComposer({ onSend, onStop, isBusy, autoFocus = false }: { onSend: (text: string) => Promise<void>; onStop: () => void; isBusy: boolean; autoFocus?: boolean }) {
  const form = useForm<ChatMessageValues>({ resolver: zodResolver(chatMessageSchema), defaultValues: { text: "" } });
  const { ref, ...field } = form.register("text");

  const submit = form.handleSubmit(async ({ text }) => {
    form.reset();
    const box = document.getElementById("chat-message");
    if (box) box.style.height = "auto";
    await onSend(text);
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-1.5">
      <div className="flex items-end gap-2 rounded-lg border border-input bg-card py-2 pr-2 pl-4 focus-within:border-ring focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
        <label htmlFor="chat-message" className="sr-only">
          Question about your documents
        </label>
        <textarea
          id="chat-message"
          ref={ref}
          {...field}
          rows={1}
          autoFocus={autoFocus}
          placeholder="Ask about your documents…"
          className="m-0 max-h-48 min-h-9 min-w-0 flex-1 resize-none appearance-none self-center rounded-none border-0 bg-transparent p-0 py-1.5 text-base text-foreground shadow-none outline-none placeholder:text-faint-foreground"
          onInput={(event) => {
            const box = event.currentTarget;
            box.style.height = "auto";
            box.style.height = `${box.scrollHeight}px`;
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              if (!isBusy) void submit();
            }
          }}
        />
        {isBusy ? (
          <Button type="button" size="icon" variant="primary" aria-label="Stop" className="size-9 shrink-0 p-0" onClick={onStop}>
            <StopIcon />
          </Button>
        ) : (
          <Button type="submit" size="icon" variant="primary" aria-label="Send" className="size-9 shrink-0 p-0">
            <ArrowUpIcon />
          </Button>
        )}
      </div>
      {form.formState.errors.text ? (
        <p className="m-0 px-4 text-xs text-destructive" role="alert">
          {form.formState.errors.text.message}
        </p>
      ) : null}
    </form>
  );
}
