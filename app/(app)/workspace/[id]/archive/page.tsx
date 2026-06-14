import { redirect } from "next/navigation"

import { ArchiveView } from "@/components/workspace/archive-view"
import { getSession } from "@/lib/auth"
import { getOwnedWorkspace } from "@/lib/db/queries/workspace"

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const { id } = await params

  const ws = await getOwnedWorkspace(id, session.user.id)
  if (!ws) redirect("/workspace")

  return <ArchiveView workspaceId={ws.id} />
}
