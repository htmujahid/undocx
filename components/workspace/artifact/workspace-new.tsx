"use client"

import { useMemo, useState } from "react"

import { defineExtension } from "lexical"
import { PanelLeftIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  HorizontalRuleExtension,
  TabIndentationExtension,
} from "@lexical/extension"
import { LinkExtension } from "@lexical/link"
import { ListExtension } from "@lexical/list"
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer"
import { RichTextExtension } from "@lexical/rich-text"
import { TableExtension } from "@lexical/table"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { CalloutExtension } from "@/components/workspace/editor/callout-extension"
import { CodeHighlightExtension } from "@/components/workspace/editor/code-highlight-extension"
import { FootnoteExtension } from "@/components/workspace/editor/footnote-extension"
import { MathExtension } from "@/components/workspace/editor/math-extension"
import { SvgExtension } from "@/components/workspace/editor/svg-extension"
import { editorTheme } from "@/components/workspace/editor/theme"
import {
  artifactsQueryOptions,
  createArtifactMutationOptions,
} from "@/lib/data/artifacts"

import { AssistantToggle } from "@/components/workspace/assistant/assistant-toggle"
import { ContentPreview } from "@/components/workspace/artifact/content-preview"
import { NewArtifactAssistant } from "@/components/workspace/assistant/new-artifact-assistant"
import { useAssistantAutoCollapse } from "@/components/workspace/assistant/use-assistant-auto-collapse"

export function WorkspaceNew({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const qc = useQueryClient()
  const [rightOpen, setRightOpen] = useState(true)
  useAssistantAutoCollapse(setRightOpen)
  const [title, setTitle] = useState("Untitled")
  const { toggleSidebar: toggleLeftSidebar } = useSidebar()

  const createMutation = useMutation({
    ...createArtifactMutationOptions,
    onSuccess: (artifact) => {
      qc.invalidateQueries({
        queryKey: artifactsQueryOptions(workspaceId).queryKey,
      })
      router.push(`/workspace/${workspaceId}/${artifact.id}`)
    },
    onError: () => toast.error("Failed to save document."),
  })

  const extension = useMemo(
    () =>
      defineExtension({
        name: "undocx/content-editor",
        namespace: "content-editor",
        theme: editorTheme,
        editable: false,
        onError: (error: Error) => console.error("[Lexical]", error),
        dependencies: [
          RichTextExtension,
          ListExtension,
          LinkExtension,
          TableExtension,
          CodeHighlightExtension,
          SvgExtension,
          MathExtension,
          HorizontalRuleExtension,
          TabIndentationExtension,
          CalloutExtension,
          FootnoteExtension,
        ],
      }),
    []
  )

  return (
    <LexicalExtensionComposer extension={extension} contentEditable={null}>
      <div className="flex h-svh min-w-0 flex-1 flex-col overflow-hidden">
        <SidebarProvider
          open={rightOpen}
          onOpenChange={setRightOpen}
          style={{ "--sidebar-width": "24rem" } as React.CSSProperties}
          className="min-h-0 flex-1"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-11 shrink-0 items-center border-b px-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleLeftSidebar}
                aria-label="Toggle sidebar"
              >
                <PanelLeftIcon />
              </Button>
              <span className="ml-2 flex-1 truncate text-xs text-muted-foreground">
                {title}
              </span>
              <AssistantToggle />
            </header>
            <ContentPreview title={title} />
          </div>
          <NewArtifactAssistant
            workspaceId={workspaceId}
            onTitleChange={setTitle}
            onGenerated={(generatedTitle, content) =>
              createMutation.mutate({
                workspaceId,
                title: generatedTitle,
                content,
              })
            }
          />
        </SidebarProvider>
      </div>
    </LexicalExtensionComposer>
  )
}
