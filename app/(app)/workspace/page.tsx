import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { workspace } from "@/lib/db/schema"

export default async function WorkspacePage() {
  const session = await getSession()
  if (!session) redirect("/auth/sign-in")

  const [first] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(eq(workspace.ownerId, session.user.id))
    .orderBy(workspace.createdAt)
    .limit(1)

  if (first) redirect(`/workspace/${first.id}`)

  // No workspaces yet — user needs to create one via the workspace switcher
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <p className="text-sm font-medium">No workspaces found</p>
      <p className="text-xs text-muted-foreground">
        Create a workspace to get started
      </p>
    </div>
  )
}
