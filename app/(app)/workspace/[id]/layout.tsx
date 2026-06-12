import { and, eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { HydrationBoundary, dehydrate } from "@tanstack/react-query"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { WorkspaceSidebar } from "@/components/workspace/sidebar/workspace-sidebar"
import { getSession } from "@/lib/auth"
import { artifactsQueryOptions } from "@/lib/data/artifacts"
import { collectionsQueryOptions } from "@/lib/data/collections"
import { foldersQueryOptions } from "@/lib/data/folders"
import { getQueryClient } from "@/lib/data/get-query-client"
import { workspacesQueryOptions } from "@/lib/data/workspaces"
import { db } from "@/lib/db"
import { workspace } from "@/lib/db/schema"

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

  const [ws] = await db
    .select()
    .from(workspace)
    .where(and(eq(workspace.id, id), eq(workspace.ownerId, session.user.id)))

  if (!ws) redirect("/workspace")

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
            name: session.user.name,
            email: session.user.email,
            image: session.user.image ?? null,
          }}
          workspaceId={ws.id}
        />
        <SidebarInset>{children}</SidebarInset>
      </HydrationBoundary>
    </SidebarProvider>
  )
}
