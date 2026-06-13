import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { getWorkspaceRole } from "@/lib/db/access"
import { artifact, artifactMember, invitation, workspaceMember } from "@/lib/db/schema"
import { isInvitationExpired } from "@/lib/invitations"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { token } = await params
  const [inv] = await db
    .select()
    .from(invitation)
    .where(eq(invitation.token, token))

  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (isInvitationExpired(inv)) {
    await db.delete(invitation).where(eq(invitation.id, inv.id))
    return NextResponse.json({ error: "Invitation expired" }, { status: 410 })
  }

  // The invitation belongs to the invited address, not whoever holds the link.
  if (inv.email !== session.user.email.toLowerCase())
    return NextResponse.json(
      { error: `This invitation was sent to ${inv.email}` },
      { status: 403 }
    )

  if (inv.workspaceId) {
    const existingRole = await getWorkspaceRole(inv.workspaceId, session.user.id)
    if (existingRole !== "owner") {
      await db
        .insert(workspaceMember)
        .values({
          workspaceId: inv.workspaceId,
          userId: session.user.id,
          role: inv.role,
        })
        .onConflictDoUpdate({
          target: [workspaceMember.workspaceId, workspaceMember.userId],
          set: { role: inv.role },
        })
    }
    await db.delete(invitation).where(eq(invitation.id, inv.id))
    return NextResponse.json({ workspaceId: inv.workspaceId, artifactId: null })
  }

  const [art] = await db
    .select({ id: artifact.id, workspaceId: artifact.workspaceId })
    .from(artifact)
    .where(eq(artifact.id, inv.artifactId!))

  if (!art) {
    await db.delete(invitation).where(eq(invitation.id, inv.id))
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Skip the direct share if the user already has workspace-wide access.
  const workspaceRole = await getWorkspaceRole(art.workspaceId, session.user.id)
  if (!workspaceRole) {
    await db
      .insert(artifactMember)
      .values({ artifactId: art.id, userId: session.user.id, role: inv.role })
      .onConflictDoUpdate({
        target: [artifactMember.artifactId, artifactMember.userId],
        set: { role: inv.role },
      })
  }
  await db.delete(invitation).where(eq(invitation.id, inv.id))
  return NextResponse.json({ workspaceId: art.workspaceId, artifactId: art.id })
}
