import { useState } from "react"

import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { PanelRightIcon } from "lucide-react"

import { AppSidebar } from "@/components/home/app-sidebar"
import { ContentPreview } from "@/components/home/content-preview"
import { PromptPanel } from "@/components/home/prompt-panel"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/auth-client"
import { authUserQueryOptions } from "@/lib/queries/auth"

export const Route = createFileRoute("/home/")({
  component: HomePage,
})

function HomePage() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [rightOpen, setRightOpen] = useState(true)

  const handleSignOut = async () => {
    await signOut()
    queryClient.setQueryData(authUserQueryOptions.queryKey, null)
    navigate({ to: "/" })
  }

  if (!user) return null

  return (
    // Outer provider: controls the right sidebar
    <SidebarProvider
      open={rightOpen}
      onOpenChange={setRightOpen}
      style={{ "--sidebar-width": "24rem" } as React.CSSProperties}
    >
      {/* Inner provider: controls the left sidebar */}
      <SidebarProvider className="flex-1 min-h-0">
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
                  rightOpen ? "text-foreground" : "text-muted-foreground",
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
  )
}
