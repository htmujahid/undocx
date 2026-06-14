"use client"

import { useEffect, useRef, useState } from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage, isTextUIPart } from "ai"
import { BotIcon, SparklesIcon } from "lucide-react"

import { $convertToMarkdownString } from "@lexical/markdown"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { RENDERICAL_TRANSFORMERS } from "@/components/workspace/editor/markdown-transformers"

// Strip the editor-only selection/insert markers so they never leak into the
// document we hand to the model.
const MARKER_RE = /<!-- @(?:selection|removed):(?:start|end) -->/g

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("")
}

export function AssistantAsk({
  workspaceId,
  contextIds,
}: {
  workspaceId: string
  contextIds: Set<string>
}) {
  const [editor] = useLexicalComposerContext()
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/assistant/ask" }),
  })

  const isLoading = status === "submitted" || status === "streaming"

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getMarkdown = (): string => {
    let md = ""
    editor.getEditorState().read(() => {
      md = $convertToMarkdownString(RENDERICAL_TRANSFORMERS)
    })
    return md.replace(MARKER_RE, "").trim()
  }

  const onSubmit = () => {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage(
      { text },
      {
        body: {
          workspaceId,
          artifactMarkdown: getMarkdown(),
          contextIds: [...contextIds],
        },
      }
    )
    setInput("")
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const showLoadingDots =
    isLoading && messages[messages.length - 1]?.role === "user"

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2.5 px-4 text-center">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted">
              <SparklesIcon className="size-4 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium">Ask about this document</p>
            <p className="text-[10px] text-muted-foreground">
              Try “Explain this” or ask a follow-up question. The whole document
              is sent as context.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-xl px-3 py-2 text-xs whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60"
                  )}
                >
                  {getMessageText(message)}
                </div>
              </div>
            ))}

            {showLoadingDots && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-xl bg-muted/60 px-3 py-2.5">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-center text-[10px] text-destructive">
                Something went wrong. Please try again.
              </p>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t p-3">
        <div
          className={cn(
            "rounded-xl border bg-muted/20 transition-all focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20",
            isLoading && "pointer-events-none opacity-60"
          )}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about this document…"
            rows={3}
            className="w-full resize-none bg-transparent px-3 pb-1 pt-3 text-xs placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="text-[10px] text-muted-foreground">
              {isLoading && (
                <span className="flex items-center gap-1 animate-pulse">
                  <BotIcon className="size-3" /> Thinking…
                </span>
              )}
            </span>
            <Button
              size="icon-sm"
              disabled={!input.trim() || isLoading}
              onClick={onSubmit}
            >
              <SparklesIcon />
            </Button>
          </div>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          <kbd className="font-mono">Enter</kbd> to ask ·{" "}
          <kbd className="font-mono">Shift+Enter</kbd> new line
        </p>
      </div>
    </div>
  )
}
