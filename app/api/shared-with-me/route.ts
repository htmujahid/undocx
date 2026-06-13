import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { artifact, artifactMember, workspace } from "@/lib/db/schema"

// Documents shared directly with the current user, across all workspaces.
// Workspace-level memberships surface through /api/workspaces instead.
export async function GET() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const shared = await db
    .select({
      id: artifact.id,
      title: artifact.title,
      workspaceId: artifact.workspaceId,
      workspaceName: workspace.name,
      role: artifactMember.role,
      updatedAt: artifact.updatedAt,
    })
    .from(artifactMember)
    .innerJoin(artifact, eq(artifact.id, artifactMember.artifactId))
    .innerJoin(workspace, eq(workspace.id, artifact.workspaceId))
    .where(
      and(
        eq(artifactMember.userId, session.user.id),
        eq(artifact.isArchived, false)
      )
    )
    .orderBy(artifact.updatedAt)

  return NextResponse.json(shared)
}
