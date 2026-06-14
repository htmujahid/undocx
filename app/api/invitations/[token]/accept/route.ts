import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { getWorkspaceRole } from "@/lib/db/queries/access"
import { getArtifactRef } from "@/lib/db/queries/artifact"
import { upsertArtifactMember } from "@/lib/db/queries/artifact-member"
import {
  deleteInvitation,
  getInvitationByToken,
} from "@/lib/db/queries/invitation"
import { upsertWorkspaceMember } from "@/lib/db/queries/workspace-member"
import { isInvitationExpired } from "@/lib/mail/invitations"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { token } = await params
  const inv = await getInvitationByToken(token)

  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (isInvitationExpired(inv)) {
    await deleteInvitation(inv.id)
    return NextResponse.json({ error: "Invitation expired" }, { status: 410 })
  }

  // The invitation belongs to the invited address, not whoever holds the link.
  if (inv.email !== session.user.email.toLowerCase())
    return NextResponse.json(
      { error: `This invitation was sent to ${inv.email}` },
      { status: 403 }
    )

  if (inv.workspaceId) {
    const existingRole = await getWorkspaceRole(
      inv.workspaceId,
      session.user.id
    )
    if (existingRole !== "owner") {
      await upsertWorkspaceMember(inv.workspaceId, session.user.id, inv.role)
    }
    await deleteInvitation(inv.id)
    return NextResponse.json({ workspaceId: inv.workspaceId, artifactId: null })
  }

  const art = await getArtifactRef(inv.artifactId!)

  if (!art) {
    await deleteInvitation(inv.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Skip the direct share if the user already has workspace-wide access.
  const workspaceRole = await getWorkspaceRole(art.workspaceId, session.user.id)
  if (!workspaceRole) {
    await upsertArtifactMember(art.id, session.user.id, inv.role)
  }
  await deleteInvitation(inv.id)
  return NextResponse.json({ workspaceId: art.workspaceId, artifactId: art.id })
}
