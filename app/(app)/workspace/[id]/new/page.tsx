import { and, eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { WorkspaceNew } from "@/components/workspace/workspace-new"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { workspace } from "@/lib/db/schema"

export default async function NewArtifactPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const { id } = await params

  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(and(eq(workspace.id, id), eq(workspace.ownerId, session.user.id)))

  if (!ws) redirect("/workspace")

  return <WorkspaceNew workspaceId={id} />
}
