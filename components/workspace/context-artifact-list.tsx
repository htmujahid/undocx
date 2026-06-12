"use client"

import { CheckIcon, FileTextIcon } from "lucide-react"

import { useQuery } from "@tanstack/react-query"

import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarContent } from "@/components/ui/sidebar"
import { artifactsQueryOptions } from "@/lib/data/artifacts"
import { cn } from "@/lib/utils"

export function ContextArtifactList({
  workspaceId,
  excludeId,
  selectedIds,
  onToggle,
}: {
  workspaceId: string
  excludeId?: string
  selectedIds: Set<string>
  onToggle: (id: string) => void
}) {
  const { data: artifacts = [] } = useQuery(artifactsQueryOptions(workspaceId))
  const candidates = artifacts.filter(
    (a) => a.id !== excludeId && !a.isArchived
  )

  return (
    <SidebarContent className="p-0">
      <div className="px-4 py-2">
        <span className="text-[11px] text-muted-foreground">
          Selected artifacts are sent as reference context.
        </span>
      </div>
      <ScrollArea className="h-full border-t">
        {candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <p className="text-xs text-muted-foreground">
              No other artifacts in this workspace.
            </p>
          </div>
        ) : (
          <div className="py-1.5">
            {candidates.map((artifact) => {
              const selected = selectedIds.has(artifact.id)
              return (
                <button
                  key={artifact.id}
                  onClick={() => onToggle(artifact.id)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-muted/50",
                    selected && "bg-muted/50"
                  )}
                >
                  <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span
                    className={cn(
                      "truncate text-[11px] leading-snug",
                      selected
                        ? "font-medium text-foreground"
                        : "text-foreground/80"
                    )}
                  >
                    {artifact.title}
                  </span>
                  {selected && (
                    <CheckIcon className="ml-auto size-3.5 shrink-0 text-primary" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </SidebarContent>
  )
}
