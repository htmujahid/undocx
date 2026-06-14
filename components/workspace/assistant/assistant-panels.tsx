"use client"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ContextArtifactList } from "@/components/workspace/assistant/context-artifact-list"
import { DocumentOutline } from "@/components/workspace/assistant/document-outline"

export function AssistantPanels({
  workspaceId,
  excludeId,
  contextIds,
  onToggleContext,
}: {
  workspaceId: string
  excludeId?: string
  contextIds: Set<string>
  onToggleContext: (id: string) => void
}) {
  return (
    <Tabs defaultValue="outline" className="min-h-0 flex-1 gap-0">
      <TabsList variant="line" className="w-full justify-start border-b px-2">
        <TabsTrigger value="outline" className="flex-none text-xs">
          Outline
        </TabsTrigger>
        <TabsTrigger value="context" className="flex-none text-xs">
          Context
          {contextIds.size > 0 && (
            <Badge
              variant="secondary"
              className="h-4 min-w-4 px-1 text-[10px] tabular-nums"
            >
              {contextIds.size}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="outline" className="flex min-h-0 flex-col">
        <DocumentOutline />
      </TabsContent>
      <TabsContent value="context" className="flex min-h-0 flex-col">
        <ContextArtifactList
          workspaceId={workspaceId}
          excludeId={excludeId}
          selectedIds={contextIds}
          onToggle={onToggleContext}
        />
      </TabsContent>
    </Tabs>
  )
}
