import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { getWorkspaceRole } from "@/lib/db/queries/access"
import { getArtifactWorkspaceId } from "@/lib/db/queries/artifact"
import {
  deleteInvitation,
  getInvitationById,
} from "@/lib/db/queries/invitation"

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

  const inv = await getInvitationById(invitationId)
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let belongsToWorkspace = inv.workspaceId === id
  if (!belongsToWorkspace && inv.artifactId) {
    const workspaceId = await getArtifactWorkspaceId(inv.artifactId)
    belongsToWorkspace = workspaceId === id
  }
  if (!belongsToWorkspace)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  await deleteInvitation(invitationId)
  return new NextResponse(null, { status: 204 })
}
