"use client"

import { useEffect, useState } from "react"

import { experimental_useObject as useObject } from "@ai-sdk/react"
import { ArrowUpIcon, SparklesIcon } from "lucide-react"
import { toast } from "sonner"

import { $convertFromMarkdownString } from "@lexical/markdown"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar"
import { outputSchema } from "@/lib/ai-schema"
import {
  artifactQueryOptions,
  artifactsQueryOptions,
  fetchContextDocuments,
  updateArtifactMutationOptions,
} from "@/lib/data/artifacts"
import { cn } from "@/lib/utils"

import { AssistantPanels } from "./assistant-panels"
import { RENDERICAL_TRANSFORMERS } from "./editor/markdown-transformers"

export function NewArtifactAssistant({
  workspaceId,
  artifactId,
  onTitleChange,
  onGenerated,
}: {
  workspaceId: string
  artifactId?: string
  onTitleChange: (title: string) => void
  /** When provided, called instead of persisting — used for the new-document flow */
  onGenerated?: (title: string, content: string) => void
}) {
  const qc = useQueryClient()
  const [editor] = useLexicalComposerContext()
  const [prompt, setPrompt] = useState("")
  const [contextIds, setContextIds] = useState<Set<string>>(new Set())

  const toggleContext = (id: string) =>
    setContextIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const saveMutation = useMutation({
    ...updateArtifactMutationOptions,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: artifactsQueryOptions(workspaceId).queryKey,
      })
      if (artifactId) {
        qc.invalidateQueries({
          queryKey: artifactQueryOptions(workspaceId, artifactId).queryKey,
        })
      }
    },
    onError: () => toast.error("Failed to save artifact."),
  })

  const applyMarkdown = (markdown: string) => {
    editor.update(() => {
      $convertFromMarkdownString(markdown, RENDERICAL_TRANSFORMERS)
    })
  }

  const { object, submit, isLoading } = useObject({
    api: "/api/chat",
    schema: outputSchema,
    onFinish: ({ object: result, error }) => {
      if (error || !result) {
        toast.error("Generation failed. Please try again.")
        return
      }
      try {
        applyMarkdown(result.content)
        const title = result.title.trim() || "Untitled"
        onTitleChange(title)
        if (onGenerated) {
          onGenerated(title, result.content)
        } else if (artifactId) {
          saveMutation.mutate({
            workspaceId,
            id: artifactId,
            title,
            content: result.content,
          })
        }
      } catch (err) {
        toast.error("Failed to apply generated content.")
        console.error("[Editor]", err)
      }
    },
    onError: (error: Error) => {
      toast.error("Generation failed. Please try again.")
      console.error("[Assistant]", error)
    },
  })

  // Stream the partial markdown into the editor as it arrives. Everything up
  // to the last blank line is made of completed blocks; the trailing block may
  // still be mid-token, so it is held back until the next frame.
  useEffect(() => {
    if (!isLoading) return
    if (object?.title) onTitleChange(object.title)
    const markdown = object?.content
    if (!markdown) return
    const cut = markdown.lastIndexOf("\n\n")
    if (cut > 0) applyMarkdown(markdown.slice(0, cut))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object])

  const handleSubmit = async () => {
    const text = prompt.trim()
    if (!text || isLoading) return
    let context
    try {
      context = await fetchContextDocuments(qc, workspaceId, contextIds)
    } catch {
      toast.error("Failed to load context artifacts.")
      return
    }
    submit({ prompt: `Topic: ${text}`, context })
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
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-3.5 text-primary" />
          <span className="text-sm font-semibold">Assistant</span>
          {(isLoading || saveMutation.isPending) && (
            <span className="ml-auto animate-pulse text-[10px] text-muted-foreground">
              {saveMutation.isPending ? "Saving…" : "Generating…"}
            </span>
          )}
        </div>
      </SidebarHeader>

      <AssistantPanels
        workspaceId={workspaceId}
        excludeId={artifactId}
        contextIds={contextIds}
        onToggleContext={toggleContext}
      />

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
              <span className="text-[10px] text-muted-foreground">
                {isLoading || saveMutation.isPending ? (
                  <span className="animate-pulse">
                    {saveMutation.isPending ? "Saving…" : "Generating…"}
                  </span>
                ) : null}
              </span>
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
