import { cache } from "react"

import { notFound, redirect } from "next/navigation"

import { HydrationBoundary, dehydrate } from "@tanstack/react-query"

import { Workspace } from "@/components/workspace/artifact/workspace"
import { getSession } from "@/lib/auth"
import { artifactQueryOptions } from "@/lib/data/artifacts"
import { getQueryClient } from "@/lib/data/get-query-client"
import { getArtifactRole } from "@/lib/db/queries/access"
import { getArtifact } from "@/lib/db/queries/artifact"

const loadArtifact = cache((id: string, artifactId: string) =>
  getArtifact(id, artifactId)
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; artifactId: string }>
}) {
  const { id, artifactId } = await params
  const art = await loadArtifact(id, artifactId)
  return { title: art?.title || "Untitled" }
}

export default async function ArtifactPage({
  params,
}: {
  params: Promise<{ id: string; artifactId: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const { id, artifactId } = await params

  const role = await getArtifactRole(id, artifactId, session.user.id)
  if (!role) redirect("/workspace")

  const art = await loadArtifact(id, artifactId)

  if (!art) notFound()

  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(artifactQueryOptions(id, artifactId))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Workspace workspaceId={id} artifactId={artifactId} />
    </HydrationBoundary>
  )
}
