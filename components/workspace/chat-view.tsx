"use client"

import { useState } from "react"

import { useChat } from "@ai-sdk/react"
import { BotIcon, SendIcon, UserIcon } from "lucide-react"
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

function getMessageText(message: UIMessage): string {
  return message.parts.filter(isTextUIPart).map((p) => p.text).join("")
}

export function ChatView({ workspaceId }: { workspaceId: string }) {
  const [input, setInput] = useState("")

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/workspaces/${workspaceId}/chat`,
    }),
  })

  const isLoading = status === "submitted" || status === "streaming"

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const showLoadingDots =
    isLoading && messages[messages.length - 1]?.role === "user"

  return (
    <div className="flex h-svh flex-col">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
        <SidebarTrigger />
        <span className="text-xs text-muted-foreground">Chat</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <BotIcon className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Chat with your knowledge base</p>
            <p className="text-xs text-muted-foreground">
              Ask questions about your artifacts. Press Enter to send.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.role === "user" ? (
                    <UserIcon className="size-3.5" />
                  ) : (
                    <BotIcon className="size-3.5" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap">{getMessageText(message)}</p>
                </div>
              </div>
            ))}

            {showLoadingDots && (
              <div className="flex gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <BotIcon className="size-3.5" />
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-center text-xs text-destructive">
                {error.message}
              </p>
            )}

            <div id="chat-bottom" />
          </div>
        )}
      </div>

      <div className="border-t p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="mx-auto flex max-w-2xl gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about your knowledge base… (Shift+Enter for newline)"
            className="min-h-0 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            className="self-end"
            disabled={isLoading || !input.trim()}
          >
            <SendIcon className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
