import { redirect } from "next/navigation"

import { HydrationBoundary, dehydrate } from "@tanstack/react-query"

import { FavoritesView } from "@/components/workspace/favorites-view"
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

  const ws = await getOwnedWorkspace(id, session.user.id)
  if (!ws) redirect("/workspace")

  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(favoritesQueryOptions(ws.id))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FavoritesView workspaceId={ws.id} />
    </HydrationBoundary>
  )
}
