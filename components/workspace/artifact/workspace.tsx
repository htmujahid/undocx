"use client"

import { useEffect, useMemo, useState } from "react"

import { defineExtension } from "lexical"
import { DownloadIcon, PanelLeftIcon } from "lucide-react"
import { toast } from "sonner"

import {
  HorizontalRuleExtension,
  TabIndentationExtension,
} from "@lexical/extension"
import { LinkExtension } from "@lexical/link"
import { ListExtension } from "@lexical/list"
import { $convertFromMarkdownString } from "@lexical/markdown"
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer"
import { RichTextExtension } from "@lexical/rich-text"
import { TableExtension } from "@lexical/table"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { CalloutExtension } from "@/components/workspace/editor/callout-extension"
import { CodeHighlightExtension } from "@/components/workspace/editor/code-highlight-extension"
import { FootnoteExtension } from "@/components/workspace/editor/footnote-extension"
import { RENDERICAL_TRANSFORMERS } from "@/components/workspace/editor/markdown-transformers"
import { MathExtension } from "@/components/workspace/editor/math-extension"
import { SelectionMarkerExtension } from "@/components/workspace/editor/selection-marker-extension"
import { SvgExtension } from "@/components/workspace/editor/svg-extension"
import { editorTheme } from "@/components/workspace/editor/theme"
import { artifactQueryOptions } from "@/lib/data/artifacts"
import {
  addRecentArtifactMutationOptions,
  recentArtifactIdsQueryOptions,
} from "@/lib/data/recent-artifacts"

import { ArtifactAssistant } from "@/components/workspace/assistant/artifact-assistant"
import { AssistantToggle } from "@/components/workspace/assistant/assistant-toggle"
import { ContentPreview } from "@/components/workspace/artifact/content-preview"
import { SharePopover } from "@/components/workspace/sharing/share-popover"
import { useAssistantAutoCollapse } from "@/components/workspace/assistant/use-assistant-auto-collapse"

export function Workspace({
  workspaceId,
  artifactId,
}: {
  workspaceId: string
  artifactId: string
}) {
  const qc = useQueryClient()
  const [rightOpen, setRightOpen] = useState(true)
  useAssistantAutoCollapse(setRightOpen)
  const { toggleSidebar: toggleLeftSidebar } = useSidebar()

  const { data: art } = useQuery(artifactQueryOptions(workspaceId, artifactId))
  const title = art?.title ?? ""
  const isOwner = art?.role === "owner"
  const canEdit = isOwner || art?.role === "editor"

  const { mutate: addRecent } = useMutation({
    ...addRecentArtifactMutationOptions,
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: recentArtifactIdsQueryOptions(workspaceId).queryKey,
      }),
  })

  useEffect(() => {
    addRecent({ workspaceId, artifactId })
  }, [workspaceId, artifactId]) // eslint-disable-line react-hooks/exhaustive-deps

  function downloadMarkdown() {
    if (!art?.content) {
      toast.error("Nothing to download yet.")
      return
    }
    const filename =
      (title
        .trim()
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase() || "document") + ".md"
    const url = URL.createObjectURL(
      new Blob([art.content], { type: "text/markdown;charset=utf-8" })
    )
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  const extension = useMemo(
    () =>
      defineExtension({
        name: "renderical/content-editor",
        namespace: "content-editor",
        theme: editorTheme,
        editable: false,
        ...(art?.content
          ? {
              $initialEditorState: () =>
                $convertFromMarkdownString(
                  art.content!,
                  RENDERICAL_TRANSFORMERS
                ),
            }
          : {}),
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
          SelectionMarkerExtension,
        ],
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [art?.content]
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
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={downloadMarkdown}
                disabled={!art?.content}
                aria-label="Download as Markdown"
              >
                <DownloadIcon className="text-muted-foreground" />
              </Button>
              {isOwner && (
                <SharePopover
                  workspaceId={workspaceId}
                  artifactId={artifactId}
                  isPublic={art?.isPublic ?? false}
                />
              )}
              {canEdit && <AssistantToggle />}
            </header>
            <ContentPreview title={title} />
          </div>
          {canEdit && (
            <ArtifactAssistant
              workspaceId={workspaceId}
              artifactId={artifactId}
            />
          )}
        </SidebarProvider>
      </div>
    </LexicalExtensionComposer>
  )
}
