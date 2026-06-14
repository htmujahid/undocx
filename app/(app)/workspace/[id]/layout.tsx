import { redirect } from "next/navigation"

import { HydrationBoundary, dehydrate } from "@tanstack/react-query"

import { CommandPalette } from "@/components/command-palette/command-palette"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { WorkspaceSidebar } from "@/components/workspace/sidebar/workspace-sidebar"
import { getSession } from "@/lib/auth"
import { artifactsQueryOptions } from "@/lib/data/artifacts"
import { collectionsQueryOptions } from "@/lib/data/collections"
import { foldersQueryOptions } from "@/lib/data/folders"
import { getQueryClient } from "@/lib/data/get-query-client"
import { workspacesQueryOptions } from "@/lib/data/workspaces"
import { getWorkspaceAccess } from "@/lib/db/queries/access"
import { getWorkspaceById } from "@/lib/db/queries/workspace"

export const metadata = {
  title: "Workspace",
}

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const { id } = await params

  // Members and artifact-level shares get in too — the APIs scope what
  // each role can actually see and do.
  const [ws, access] = await Promise.all([
    getWorkspaceById(id),
    getWorkspaceAccess(id, session.user.id),
  ])

  if (!ws || !access) redirect("/workspace")

  const queryClient = getQueryClient()

  await Promise.all([
    queryClient.prefetchQuery(workspacesQueryOptions),
    queryClient.prefetchQuery(foldersQueryOptions(ws.id)),
    queryClient.prefetchQuery(collectionsQueryOptions(ws.id)),
    queryClient.prefetchQuery(artifactsQueryOptions(ws.id)),
  ])

  return (
    <SidebarProvider>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <WorkspaceSidebar
          user={{
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image ?? null,
          }}
          workspaceId={ws.id}
        />
        <CommandPalette workspaceId={ws.id} userId={session.user.id}>
          <SidebarInset>{children}</SidebarInset>
        </CommandPalette>
      </HydrationBoundary>
    </SidebarProvider>
  )
}
