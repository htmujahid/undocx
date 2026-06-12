"use client"

import { useEffect, useMemo, useState } from "react"

import { defineExtension } from "lexical"
import { PanelRightIcon } from "lucide-react"

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
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CalloutExtension } from "@/components/workspace/editor/callout-extension"
import { CodeHighlightExtension } from "@/components/workspace/editor/code-highlight-extension"
import { FootnoteExtension } from "@/components/workspace/editor/footnote-extension"
import { MathExtension } from "@/components/workspace/editor/math-extension"
import { SvgExtension } from "@/components/workspace/editor/svg-extension"
import { editorTheme } from "@/components/workspace/editor/theme"
import {
  addRecentArtifactMutationOptions,
  recentArtifactIdsQueryOptions,
} from "@/lib/data/recent-artifacts"
import { cn } from "@/lib/utils"

import { ContentPreview } from "./content-preview"
import { PromptPanel } from "./prompt-panel"

interface WorkspaceProps {
  workspaceId: string
  artifactId: string
  initialTitle: string
  initialContent: unknown
}

export function Workspace({
  workspaceId,
  artifactId,
  initialTitle,
  initialContent,
}: WorkspaceProps) {
  const qc = useQueryClient()
  const [rightOpen, setRightOpen] = useState(true)
  const [title, setTitle] = useState(initialTitle)

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
        ...(initialContent
          ? { $initialEditorState: JSON.stringify(initialContent) }
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
        ],
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <LexicalExtensionComposer extension={extension} contentEditable={null}>
      <div className="flex h-svh min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header outside the right SidebarProvider so SidebarTrigger reaches the layout's left sidebar context */}
        <header className="flex h-11 shrink-0 items-center border-b px-2">
          <SidebarTrigger />
          <span className="ml-2 flex-1 truncate text-xs text-muted-foreground">
            {title}
          </span>
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

        {/* Right sidebar provider wraps content + prompt panel */}
        <SidebarProvider
          open={rightOpen}
          onOpenChange={setRightOpen}
          style={{ "--sidebar-width": "24rem" } as React.CSSProperties}
          className="min-h-0 flex-1"
        >
          <ContentPreview title={title} />
          <PromptPanel
            workspaceId={workspaceId}
            artifactId={artifactId}
            onTitleChange={setTitle}
          />
        </SidebarProvider>
      </div>
    </LexicalExtensionComposer>
  )
}
