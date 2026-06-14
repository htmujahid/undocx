import { after } from "next/server"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { getWorkspaceRole } from "@/lib/db/queries/access"
import {
  artifactInWorkspace,
  getArtifactTitle,
} from "@/lib/db/queries/artifact"
import {
  removeArtifactMember,
  updateArtifactMemberRole,
} from "@/lib/db/queries/artifact-member"
import { createNotification } from "@/lib/db/queries/notification"
import {
  MEMBER_ROLES,
  type MemberRole,
  type NotificationType,
} from "@/lib/db/schema"

function notifyMember(
  type: NotificationType,
  userId: string,
  workspaceId: string,
  artifactId: string,
  actorId: string,
  actorName: string,
  role?: MemberRole
) {
  after(async () => {
    const art = await getArtifactTitle(workspaceId, artifactId)
    await createNotification({
      userId,
      type,
      actorId,
      workspaceId,
      artifactId,
      data: { actorName, resourceName: art?.title ?? "a document", role },
    })
  })
}

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

  notifyMember(
    "artifact_role_changed",
    userId,
    id,
    artifactId,
    session.user.id,
    session.user.name,
    newRole as MemberRole
  )
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

  if (userId !== session.user.id)
    notifyMember(
      "artifact_removed",
      userId,
      id,
      artifactId,
      session.user.id,
      session.user.name
    )
  return new NextResponse(null, { status: 204 })
}
