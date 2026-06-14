import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { getWorkspaceRole } from "@/lib/db/queries/access"
import { artifactInWorkspace } from "@/lib/db/queries/artifact"
import {
  removeArtifactMember,
  updateArtifactMemberRole,
} from "@/lib/db/queries/artifact-member"
import { MEMBER_ROLES, type MemberRole } from "@/lib/db/schema"

export async function PATCH(
  req: Request,
  {
    params,
  }: { params: Promise<{ id: string; artifactId: string; userId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, artifactId, userId } = await params
  const role = await getWorkspaceRole(id, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (role !== "owner")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!(await artifactInWorkspace(id, artifactId)))
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { role: newRole } = await req.json()
  if (!MEMBER_ROLES.includes(newRole as MemberRole))
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })

  const updated = await updateArtifactMemberRole(artifactId, userId, newRole)

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: { params: Promise<{ id: string; artifactId: string; userId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, artifactId, userId } = await params

  // Owners remove anyone; a member may remove themselves (leave the share).
  if (userId !== session.user.id) {
    const role = await getWorkspaceRole(id, session.user.id)
    if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (role !== "owner")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!(await artifactInWorkspace(id, artifactId)))
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const deleted = await removeArtifactMember(artifactId, userId)

  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
