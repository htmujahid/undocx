import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { listSharedWithUser } from "@/lib/db/queries/artifact-member"

// Documents shared directly with the current user, across all workspaces.
// Workspace-level memberships surface through /api/workspaces instead.
export async function GET() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const shared = await listSharedWithUser(session.user.id)

  return NextResponse.json(shared)
}
