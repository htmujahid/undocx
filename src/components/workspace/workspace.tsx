import { useMemo, useState } from "react"

import { defineExtension } from "lexical"
import { PanelRightIcon } from "lucide-react"

import { LinkExtension } from "@lexical/link"
import { ListExtension } from "@lexical/list"
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer"
import { RichTextExtension } from "@lexical/rich-text"
import { TableExtension } from "@lexical/table"

import { CodeHighlightExtension } from "@/components/workspace/editor/code-highlight-extension"
import { HtmlExtension } from "@/components/workspace/editor/html-extension"

import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { editorTheme } from "@/components/workspace/editor/theme"
import { signOut } from "@/lib/auth-client"
import { authUserQueryOptions } from "@/lib/queries/auth"
import { cn } from "@/lib/utils"

import { AppSidebar } from "./app-sidebar"
import { ContentPreview } from "./content-preview"
import { PromptPanel } from "./prompt-panel"

interface WorkspaceProps {
  user: { name: string; email: string; image?: string | null }
  data: { editorState: unknown }
}

export function Workspace({ user, data }: WorkspaceProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [rightOpen, setRightOpen] = useState(true)

  const handleSignOut = async () => {
    await signOut()
    queryClient.setQueryData(authUserQueryOptions.queryKey, null)
    navigate({ to: "/" })
  }

  const extension = useMemo(
    () =>
      defineExtension({
        name: "renderical/content-editor",
        namespace: "content-editor",
        theme: editorTheme,
        editable: false,
        $initialEditorState: JSON.stringify(data.editorState),
        onError: (error: Error) => console.error("[Lexical]", error),
        dependencies: [RichTextExtension, ListExtension, LinkExtension, TableExtension, CodeHighlightExtension, HtmlExtension],
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <LexicalExtensionComposer extension={extension} contentEditable={null}>
      {/* Outer provider: controls the right sidebar */}
      <SidebarProvider
        open={rightOpen}
        onOpenChange={setRightOpen}
        style={{ "--sidebar-width": "24rem" } as React.CSSProperties}
      >
        {/* Inner provider: controls the left sidebar */}
        <SidebarProvider className="min-h-0 flex-1">
          <AppSidebar user={user} onSignOut={handleSignOut} />
          <SidebarInset className="flex h-svh flex-col overflow-hidden">
            <header className="flex h-11 shrink-0 items-center border-b px-2">
              <SidebarTrigger />
              <span className="ml-2 flex-1 text-xs text-muted-foreground">
                My Workspace
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
            <ContentPreview />
          </SidebarInset>
        </SidebarProvider>

        {/* Right sidebar — uses the outer SidebarProvider context */}
        <PromptPanel />
      </SidebarProvider>
    </LexicalExtensionComposer>
  )
}
