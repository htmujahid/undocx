import { and, eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { Workspace } from "@/components/workspace/workspace"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { artifact, workspace } from "@/lib/db/schema"

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

  const [art] = await db
    .select()
    .from(artifact)
    .where(and(eq(artifact.id, artifactId), eq(artifact.workspaceId, id)))

  if (!art) redirect(`/workspace/${id}`)

  return (
    <Workspace
      workspaceId={id}
      artifactId={art.id}
      initialTitle={art.title}
      initialContent={art.content}
    />
  )
}
