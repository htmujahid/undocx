"use client"

import { useEffect, useMemo, useState } from "react"

import { defineExtension } from "lexical"
import { PanelLeftIcon, PanelRightIcon } from "lucide-react"

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
import { cn } from "@/lib/utils"

import { ContentPreview } from "./content-preview"
import { SharePopover } from "./share-popover"
import { UpdatePromptSidebar } from "./update-prompt-sidebar"

export function Workspace({
  workspaceId,
  artifactId,
}: {
  workspaceId: string
  artifactId: string
}) {
  const qc = useQueryClient()
  const [rightOpen, setRightOpen] = useState(true)
  // Captured from the layout's left sidebar context — the header lives inside
  // the right SidebarProvider, where SidebarTrigger would toggle the wrong one.
  const { toggleSidebar: toggleLeftSidebar } = useSidebar()

  // Hydrated by the server component — available synchronously on first render.
  const { data: art } = useQuery(artifactQueryOptions(workspaceId, artifactId))
  const title = art?.title ?? ""

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
    [art]
  )

  return (
    <LexicalExtensionComposer extension={extension} contentEditable={null}>
      <div className="flex h-svh min-w-0 flex-1 flex-col overflow-hidden">
        {/* The prompt sidebar is position:fixed and spans the full viewport
            height, so the header must live inside the provider's content
            column — otherwise its right-side buttons render underneath it. */}
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
              <SharePopover
                workspaceId={workspaceId}
                artifactId={artifactId}
                isPublic={art?.isPublic ?? false}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setRightOpen((o) => !o)}
                aria-label="Toggle copilot panel"
              >
                <PanelRightIcon
                  className={cn(
                    "transition-colors",
                    rightOpen ? "text-foreground" : "text-muted-foreground"
                  )}
                />
              </Button>
            </header>
            <ContentPreview title={title} />
          </div>
          <UpdatePromptSidebar
            workspaceId={workspaceId}
            artifactId={artifactId}
          />
        </SidebarProvider>
      </div>
    </LexicalExtensionComposer>
  )
}
