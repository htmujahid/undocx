import { cache } from "react"

import { and, eq } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"

import { HydrationBoundary, dehydrate } from "@tanstack/react-query"

import { Workspace } from "@/components/workspace/workspace"
import { getSession } from "@/lib/auth"
import { artifactQueryOptions } from "@/lib/data/artifacts"
import { getQueryClient } from "@/lib/data/get-query-client"
import { db } from "@/lib/db"
import { artifact, workspace } from "@/lib/db/schema"

const getArtifact = cache(async (id: string, artifactId: string) => {
  const [art] = await db
    .select()
    .from(artifact)
    .where(and(eq(artifact.id, artifactId), eq(artifact.workspaceId, id)))
  return art ?? null
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; artifactId: string }>
}) {
  const { id, artifactId } = await params
  const art = await getArtifact(id, artifactId)
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

  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(and(eq(workspace.id, id), eq(workspace.ownerId, session.user.id)))

  if (!ws) redirect("/workspace")

  const art = await getArtifact(id, artifactId)

  if (!art) notFound()

  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(artifactQueryOptions(id, artifactId))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Workspace workspaceId={id} artifactId={artifactId} />
    </HydrationBoundary>
  )
}
