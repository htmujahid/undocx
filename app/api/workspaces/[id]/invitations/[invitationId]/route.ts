import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { getWorkspaceRole } from "@/lib/db/access"
import { artifact, invitation } from "@/lib/db/schema"

// Revokes a pending invitation — works for both workspace invitations and
// invitations to any artifact inside this workspace.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, invitationId } = await params
  const role = await getWorkspaceRole(id, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (role !== "owner")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const [inv] = await db
    .select({
      id: invitation.id,
      workspaceId: invitation.workspaceId,
      artifactId: invitation.artifactId,
    })
    .from(invitation)
    .where(eq(invitation.id, invitationId))

  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let belongsToWorkspace = inv.workspaceId === id
  if (!belongsToWorkspace && inv.artifactId) {
    const [art] = await db
      .select({ workspaceId: artifact.workspaceId })
      .from(artifact)
      .where(eq(artifact.id, inv.artifactId))
    belongsToWorkspace = art?.workspaceId === id
  }
  if (!belongsToWorkspace)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.delete(invitation).where(eq(invitation.id, invitationId))
  return new NextResponse(null, { status: 204 })
}
