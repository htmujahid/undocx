import { redirect } from "next/navigation"

import { HydrationBoundary, dehydrate } from "@tanstack/react-query"

import { WorkspaceHome } from "@/components/workspace/workspace-home"
import { getSession } from "@/lib/auth"
import { favoritesQueryOptions } from "@/lib/data/favorites"
import { getQueryClient } from "@/lib/data/get-query-client"
import { getWorkspaceAccess } from "@/lib/db/access"

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const { id } = await params

  const access = await getWorkspaceAccess(id, session.user.id)
  if (!access) redirect("/workspace")

  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(favoritesQueryOptions(id))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkspaceHome workspaceId={id} />
    </HydrationBoundary>
  )
}
