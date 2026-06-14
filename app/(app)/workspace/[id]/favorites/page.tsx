import { redirect } from "next/navigation"

import { HydrationBoundary, dehydrate } from "@tanstack/react-query"

import { FavoritesView } from "@/components/workspace/views/favorites-view"
import { getSession } from "@/lib/auth"
import { favoritesQueryOptions } from "@/lib/data/favorites"
import { getQueryClient } from "@/lib/data/get-query-client"
import { getOwnedWorkspace } from "@/lib/db/queries/workspace"

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const { id } = await params

  const workspace = await getOwnedWorkspace(id, session.user.id)
  if (!workspace) redirect("/workspace")

  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(favoritesQueryOptions(workspace.id))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FavoritesView workspaceId={workspace.id} />
    </HydrationBoundary>
  )
}
