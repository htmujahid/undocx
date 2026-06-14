import { redirect } from "next/navigation"

import { HydrationBoundary, dehydrate } from "@tanstack/react-query"

import { CollectionView } from "@/components/workspace/views/collection-view"
import { getSession } from "@/lib/auth"
import { favoritesQueryOptions } from "@/lib/data/favorites"
import { getQueryClient } from "@/lib/data/get-query-client"
import { getOwnedWorkspace } from "@/lib/db/queries/workspace"

export default async function CollectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ collectionId?: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const [{ id }, { collectionId }] = await Promise.all([params, searchParams])

  if (!collectionId) redirect(`/workspace/${id}`)

  const workspace = await getOwnedWorkspace(id, session.user.id)
  if (!workspace) redirect("/workspace")

  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(favoritesQueryOptions(workspace.id))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CollectionView workspaceId={workspace.id} collectionId={collectionId} />
    </HydrationBoundary>
  )
}
