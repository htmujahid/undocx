import { and, eq, gt } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { artifact, invitation, user, workspace } from "@/lib/db/schema"

// Pending invitations addressed to the signed-in user's (verified) email.
// The token is included — the invitee is its rightful holder and the client
// uses it to accept/decline via /api/invitations/[token]/*.
export async function GET() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const invitations = await db
    .select({
      id: invitation.id,
      token: invitation.token,
      role: invitation.role,
      workspaceId: invitation.workspaceId,
      artifactId: invitation.artifactId,
      workspaceName: workspace.name,
      artifactTitle: artifact.title,
      inviterName: user.name,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    })
    .from(invitation)
    .innerJoin(user, eq(user.id, invitation.invitedBy))
    .leftJoin(workspace, eq(workspace.id, invitation.workspaceId))
    .leftJoin(artifact, eq(artifact.id, invitation.artifactId))
    .where(
      and(
        eq(invitation.email, session.user.email.toLowerCase()),
        gt(invitation.expiresAt, new Date())
      )
    )
    .orderBy(invitation.createdAt)

  return NextResponse.json(invitations)
}
