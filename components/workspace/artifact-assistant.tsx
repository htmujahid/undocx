"use client"

import { useState } from "react"

import { ArrowUpIcon, MousePointerClickIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

import { ModeBadge } from "./copilot-mode-badge"
import { CopilotPanels } from "./copilot-panels"
import { useCopilotSubmit } from "./use-copilot-submit"

export function ArtifactAssistant({
  workspaceId,
  artifactId,
}: {
  workspaceId: string
  artifactId: string
}) {
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
  } = useCopilotSubmit({ workspaceId, artifactId, contextIds })

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
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-3.5 text-primary" />
          <span className="text-sm font-semibold">Copilot</span>
          {(isLoading || isSaving) && (
            <span className="ml-auto animate-pulse text-[10px] text-muted-foreground">
              {isSaving ? "Saving…" : loadingLabel}
            </span>
          )}
        </div>
      </SidebarHeader>

      <CopilotPanels
        workspaceId={workspaceId}
        excludeId={artifactId}
        contextIds={contextIds}
        onToggleContext={toggleContext}
      />

      <SidebarFooter className="p-0">
        <Separator />

        {hasStart && !hasBoth && <ModeBadge mode="insert" />}
        {hasBoth && <ModeBadge mode="replace" />}

        <div className="px-3 py-3">
          {disabled ? (
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
    </Sidebar>
  )
}
