"use client"

import { useState } from "react"

import { ScanTextIcon, SparklesIcon } from "lucide-react"

import { Sidebar, SidebarHeader } from "@/components/ui/sidebar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AssistantAsk } from "@/components/workspace/assistant/assistant-ask"
import { AssistantEdit } from "@/components/workspace/assistant/assistant-edit"
import { DocumentOutline } from "@/components/workspace/assistant/document-outline"

type MainTab = "outline" | "copilot"
type CopilotMode = "ask" | "edit"

export function ArtifactAssistant({
  workspaceId,
  artifactId,
  canEdit = true,
}: {
  workspaceId: string
  artifactId: string
  canEdit?: boolean
}) {
  const [tab, setTab] = useState<MainTab>("copilot")
  const [copilotMode, setCopilotMode] = useState<CopilotMode>("ask")
  const [contextIds, setContextIds] = useState<Set<string>>(new Set())

  const toggleContext = (id: string) =>
    setContextIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarHeader className="gap-0 border-b p-0">
        <div className="px-3 pt-3 pb-2.5">
          <ToggleGroup
            value={[tab]}
            onValueChange={(value) => {
              const next = (value as MainTab[])[0]
              if (next) setTab(next)
            }}
            spacing={0}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <ToggleGroupItem value="outline" className="flex-1 text-xs">
              <ScanTextIcon className="size-3.5" /> Outline
            </ToggleGroupItem>
            <ToggleGroupItem value="copilot" className="flex-1 text-xs">
              <SparklesIcon className="size-3.5" /> Copilot
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </SidebarHeader>

      {tab === "outline" ? (
        <DocumentOutline />
      ) : !canEdit || copilotMode === "ask" ? (
        <AssistantAsk
          workspaceId={workspaceId}
          contextIds={contextIds}
          copilotMode={canEdit ? copilotMode : "ask"}
          onModeChange={canEdit ? setCopilotMode : undefined}
        />
      ) : (
        <AssistantEdit
          workspaceId={workspaceId}
          artifactId={artifactId}
          contextIds={contextIds}
          toggleContext={toggleContext}
          copilotMode={copilotMode}
          onModeChange={setCopilotMode}
        />
      )}
    </Sidebar>
  )
}
