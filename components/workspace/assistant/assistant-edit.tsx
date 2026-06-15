"use client"

import { useState } from "react"

import {
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarFooter } from "@/components/ui/sidebar"
import { ModeBadge } from "@/components/workspace/assistant/assistant-mode-badge"
import { ContextArtifactList } from "@/components/workspace/assistant/context-artifact-list"
import { useAssistantSubmit } from "@/components/workspace/assistant/use-assistant-submit"
import { cn } from "@/lib/utils"

type CopilotMode = "ask" | "edit"

export function AssistantEdit({
  workspaceId,
  artifactId,
  contextIds,
  toggleContext,
  copilotMode,
  onModeChange,
}: {
  workspaceId: string
  artifactId: string
  contextIds: Set<string>
  toggleContext: (id: string) => void
  copilotMode: CopilotMode
  onModeChange: (mode: CopilotMode) => void
}) {
  const [prompt, setPrompt] = useState("")

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
    <>
      <ContextArtifactList
        workspaceId={workspaceId}
        excludeId={artifactId}
        selectedIds={contextIds}
        onToggle={toggleContext}
      />

      <SidebarFooter className="p-0">
        <Separator />

        {!pendingMode && hasStart && !hasBoth && <ModeBadge mode="insert" />}
        {!pendingMode && hasBoth && <ModeBadge mode="replace" />}

        <div className="px-3 py-3">
          {pendingMode ? (
            <div className="rounded-xl border bg-muted/20 p-3">
              <p className="text-xs font-medium">
                {pendingMode === "insert" ? "Content inserted" : "Section replaced"}
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
                  placeholder={
                    disabled ? "Hover the document to place a marker…" : placeholder
                  }
                  rows={3}
                  className="w-full resize-none bg-transparent px-3 pb-1 pt-3 text-xs placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="flex items-center justify-between px-2 pb-2">
                  {isLoading || isSaving ? (
                    <span className="animate-pulse text-[10px] text-muted-foreground">
                      {isSaving ? "Saving…" : loadingLabel}
                    </span>
                  ) : (
                    <div className="relative flex items-center">
                      <select
                        value={copilotMode}
                        onChange={(e) => onModeChange(e.target.value as CopilotMode)}
                        className="cursor-pointer appearance-none bg-transparent py-0.5 pl-1.5 pr-4 text-[10px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground"
                      >
                        <option value="ask">Ask</option>
                        <option value="edit">Edit</option>
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-0 size-2.5 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    size="icon-sm"
                    disabled={disabled || !prompt.trim() || isLoading}
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
  )
}
