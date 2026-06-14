import { redirect } from "next/navigation"

import { RecentView } from "@/components/workspace/views/recent-view"
import { getSession } from "@/lib/auth"
import { getOwnedWorkspace } from "@/lib/db/queries/workspace"

export default async function RecentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const { id } = await params

  const workspace = await getOwnedWorkspace(id, session.user.id)
  if (!workspace) redirect("/workspace")

  return <RecentView workspaceId={workspace.id} />
}
