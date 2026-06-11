import { and, eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { WorkspaceHome } from "@/components/workspace/workspace-home"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { workspace } from "@/lib/db/schema"

export default async function WorkspacePage({
  params,
}: {
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

  return <WorkspaceHome workspaceId={ws.id} />
}
