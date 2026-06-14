import { redirect } from "next/navigation"

import { WorkspaceNew } from "@/components/workspace/workspace-new"
import { getSession } from "@/lib/auth"
import { getOwnedWorkspace } from "@/lib/db/queries/workspace"

export default async function NewArtifactPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const { id } = await params

  const ws = await getOwnedWorkspace(id, session.user.id)
  if (!ws) redirect("/workspace")

  return <WorkspaceNew workspaceId={id} />
}
