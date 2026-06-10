import { useEffect, useState } from "react"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $isHeadingNode } from "@lexical/rich-text"
import { ArrowUpIcon, SparklesIcon } from "lucide-react"
import { $getRoot } from "lexical"
import { toast } from "sonner"

import { fetchServerSentEvents, useChat } from "@tanstack/ai-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { outputSchema } from "@/lib/ai-schema"
import type { GeneratedOutput } from "@/lib/ai-schema"

// ── Outline ───────────────────────────────────────────────────────────────────

interface OutlineItem {
  key: string
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  text: string
}

const LEVEL_INDENT: Record<OutlineItem["tag"], number> = {
  h1: 0,
  h2: 12,
  h3: 22,
  h4: 30,
  h5: 36,
  h6: 40,
}

const LEVEL_TEXT: Record<OutlineItem["tag"], string> = {
  h1: "text-[11px] font-medium text-foreground",
  h2: "text-[11px] text-foreground/80",
  h3: "text-[11px] text-muted-foreground",
  h4: "text-[10px] text-muted-foreground/80",
  h5: "text-[10px] text-muted-foreground/70",
  h6: "text-[10px] text-muted-foreground/60",
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PromptPanelProps {
  onTitleChange: (title: string) => void
}

export function PromptPanel({ onTitleChange }: PromptPanelProps) {
  const [editor] = useLexicalComposerContext()
  const [prompt, setPrompt] = useState("")
  const [outline, setOutline] = useState<OutlineItem[]>([])

  const { sendMessage, messages, isLoading, clear, partial, final } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
    outputSchema,
    onError: (error) => {
      toast.error("Generation failed. Please try again.")
      console.error("[Copilot]", error)
    },
  })

  // Derive char count from the accumulating raw JSON buffer on the structured-output part
  const rawLength =
    messages
      .at(-1)
      ?.parts.find((p) => p.type === "structured-output")
      ?.raw?.length ?? 0

  // Apply the validated structured output once the stream completes.
  useEffect(() => {
    if (!final) return
    try {
      const result = final as GeneratedOutput
      editor.setEditorState(
        editor.parseEditorState(JSON.stringify(result.editorState))
      )
      onTitleChange(result.title)
      setTimeout(clear, 0)
    } catch (err) {
      toast.error("Failed to apply generated content.")
      console.error("[Editor]", err)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [final])

  // Keep the outline in sync with editor headings
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const buildOutline = () => {
      editor.getEditorState().read(() => {
        setOutline(
          $getRoot()
            .getChildren()
            .filter($isHeadingNode)
            .map((node) => ({
              key: node.getKey(),
              tag: node.getTag() as OutlineItem["tag"],
              text: node.getTextContent().trim() || node.getTag().toUpperCase(),
            }))
        )
      })
    }
    buildOutline()
    return editor.registerUpdateListener(() => buildOutline())
  }, [editor])

  const scrollToHeading = (key: string) => {
    editor.getElementByKey(key)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleSubmit = () => {
    const text = prompt.trim()
    if (!text || isLoading) return
    sendMessage(`Topic: ${text}`)
    setPrompt("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Sidebar side="right" collapsible="offcanvas">
      {/* ── Header ── */}
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-3.5 text-primary" />
          <span className="text-sm font-semibold">Copilot</span>
          {isLoading && (
            <span className="ml-auto animate-pulse text-[10px] text-muted-foreground">
              Generating…
            </span>
          )}
        </div>
      </SidebarHeader>

      {/* ── Outline ── */}
      <SidebarContent className="p-0">
        <div className="px-4 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Outline
          </span>
        </div>
        <Separator />
        {isLoading && (
          <div className="border-b px-4 py-2.5">
            {partial?.title ? (
              <p className="truncate text-[11px] font-medium text-foreground">
                {partial.title}
              </p>
            ) : null}
            {rawLength > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {rawLength.toLocaleString()} chars streamed…
              </p>
            )}
          </div>
        )}
        <ScrollArea className="h-full">
          {outline.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <p className="text-xs text-muted-foreground">No headings yet.</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Add headings to see the document outline.
              </p>
            </div>
          ) : (
            <div className="py-1.5">
              {outline.map((item) => (
                <button
                  key={item.key}
                  onClick={() => scrollToHeading(item.key)}
                  style={{ paddingLeft: `${LEVEL_INDENT[item.tag] + 12}px` }}
                  className="group relative flex w-full items-center rounded-sm py-1 pr-3 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="absolute inset-y-1 left-0 w-0.5 scale-y-0 rounded-full bg-primary/60 transition-transform group-hover:scale-y-100" />
                  <span className={cn("truncate leading-snug", LEVEL_TEXT[item.tag])}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </SidebarContent>

      {/* ── Prompt input ── */}
      <SidebarFooter className="p-0">
        <Separator />
        <div className="px-3 py-3">
          <div
            className={cn(
              "rounded-xl border bg-muted/20 transition-all focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20",
              isLoading && "pointer-events-none opacity-60"
            )}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what to generate…"
              rows={3}
              className="w-full resize-none bg-transparent px-3 pb-1 pt-3 text-xs placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <div />
              <Button
                size="icon-sm"
                disabled={!prompt.trim() || isLoading}
                onClick={handleSubmit}
              >
                <ArrowUpIcon />
              </Button>
            </div>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            <kbd className="font-mono">Enter</kbd> to generate ·{" "}
            <kbd className="font-mono">Shift+Enter</kbd> new line
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
