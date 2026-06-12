import { and, eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { FolderView } from "@/components/workspace/folder-view"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { workspace } from "@/lib/db/schema"

export default async function FoldersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ folderId?: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const [{ id }, { folderId }] = await Promise.all([params, searchParams])

  if (!folderId) redirect(`/workspace/${id}`)

  const [ws] = await db
    .select()
    .from(workspace)
    .where(and(eq(workspace.id, id), eq(workspace.ownerId, session.user.id)))

  if (!ws) redirect("/workspace")

  return <FolderView workspaceId={ws.id} folderId={folderId} />
}
