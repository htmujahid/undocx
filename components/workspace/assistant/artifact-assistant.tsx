"use client"

import { useState } from "react"

import {
  ArrowUpIcon,
  CheckIcon,
  MessageCircleIcon,
  MousePointerClickIcon,
  PencilIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AssistantAsk } from "@/components/workspace/assistant/assistant-ask"
import { ModeBadge } from "@/components/workspace/assistant/assistant-mode-badge"
import { AssistantPanels } from "@/components/workspace/assistant/assistant-panels"
import { useAssistantSubmit } from "@/components/workspace/assistant/use-assistant-submit"
import { cn } from "@/lib/utils"

type AssistantMode = "ask" | "edit"

export function ArtifactAssistant({
  workspaceId,
  artifactId,
}: {
  workspaceId: string
  artifactId: string
}) {
  const [mode, setMode] = useState<AssistantMode>("ask")
  const [prompt, setPrompt] = useState("")
  const [contextIds, setContextIds] = useState<Set<string>>(new Set())

  const toggleContext = (id: string) =>
    setContextIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const {
    hasStart,
    hasBoth,
    disabled,
    isLoading,
    isSaving,
    loadingLabel,
    placeholder,
    submitLabel,
    handleSubmit,
    pendingMode,
    acceptPending,
    rejectPending,
  } = useAssistantSubmit({ workspaceId, artifactId, contextIds })

  const onSubmit = () => {
    handleSubmit(prompt)
    setPrompt("")
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarHeader className="gap-2.5 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-3.5 text-primary" />
          <span className="text-sm font-semibold">Assistant</span>
          {mode === "edit" && (isLoading || isSaving) && (
            <span className="ml-auto animate-pulse text-[10px] text-muted-foreground">
              {isSaving ? "Saving…" : loadingLabel}
            </span>
          )}
        </div>
        <ToggleGroup
          value={[mode]}
          onValueChange={(value) => {
            const next = (value as AssistantMode[])[0]
            if (next) setMode(next)
          }}
          spacing={0}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ToggleGroupItem value="ask" className="flex-1 text-xs">
            <MessageCircleIcon className="size-3.5" /> Ask
          </ToggleGroupItem>
          <ToggleGroupItem value="edit" className="flex-1 text-xs">
            <PencilIcon className="size-3.5" /> Edit
          </ToggleGroupItem>
        </ToggleGroup>
      </SidebarHeader>

      {mode === "ask" ? (
        <AssistantAsk workspaceId={workspaceId} contextIds={contextIds} />
      ) : (
        <>
          <AssistantPanels
            workspaceId={workspaceId}
            excludeId={artifactId}
            contextIds={contextIds}
            onToggleContext={toggleContext}
          />

          <SidebarFooter className="p-0">
            <Separator />

            {!pendingMode && hasStart && !hasBoth && (
              <ModeBadge mode="insert" />
            )}
            {!pendingMode && hasBoth && <ModeBadge mode="replace" />}

            <div className="px-3 py-3">
              {pendingMode ? (
                <div className="rounded-xl border bg-muted/20 p-3">
                  <p className="text-xs font-medium">
                    {pendingMode === "insert"
                      ? "Content inserted"
                      : "Section replaced"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Review the change in the document, then accept or reject it.
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={isSaving}
                      onClick={acceptPending}
                    >
                      <CheckIcon /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      disabled={isSaving}
                      onClick={rejectPending}
                    >
                      <XIcon /> Reject
                    </Button>
                  </div>
                </div>
              ) : disabled ? (
                <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed py-6 text-center">
                  <MousePointerClickIcon className="size-5 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    Hover the document to place a marker
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "rounded-xl border bg-muted/20 transition-all focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20",
                      isLoading && "pointer-events-none opacity-60"
                    )}
                  >
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder={placeholder}
                      rows={3}
                      className="w-full resize-none bg-transparent px-3 pb-1 pt-3 text-xs placeholder:text-muted-foreground focus:outline-none"
                    />
                    <div className="flex items-center justify-between px-2 pb-2">
                      <span className="text-[10px] text-muted-foreground">
                        {(isLoading || isSaving) && (
                          <span className="animate-pulse">
                            {isSaving ? "Saving…" : loadingLabel}
                          </span>
                        )}
                      </span>
                      <Button
                        size="icon-sm"
                        disabled={!prompt.trim() || isLoading}
                        onClick={onSubmit}
                      >
                        <ArrowUpIcon />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                    <kbd className="font-mono">Enter</kbd> {submitLabel} ·{" "}
                    <kbd className="font-mono">Shift+Enter</kbd> new line
                  </p>
                </>
              )}
            </div>
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  )
}
