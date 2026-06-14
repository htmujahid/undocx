import { after } from "next/server"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { getWorkspaceRole } from "@/lib/db/queries/access"
import { createNotification } from "@/lib/db/queries/notification"
import { getWorkspaceName } from "@/lib/db/queries/workspace"
import {
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
} from "@/lib/db/queries/workspace-member"
import {
  MEMBER_ROLES,
  type MemberRole,
  type NotificationType,
} from "@/lib/db/schema"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, userId } = await params
  const role = await getWorkspaceRole(id, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (role !== "owner")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { role: newRole } = await req.json()
  if (!MEMBER_ROLES.includes(newRole as MemberRole))
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })

  const updated = await updateWorkspaceMemberRole(id, userId, newRole)

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  notifyMember(
    "workspace_role_changed",
    userId,
    id,
    session.user.id,
    session.user.name,
    newRole as MemberRole
  )
  return NextResponse.json(updated)
}

// Let an affected member know about a workspace membership change. Best-effort,
// off the response path.
function notifyMember(
  type: NotificationType,
  userId: string,
  workspaceId: string,
  actorId: string,
  actorName: string,
  role?: MemberRole
) {
  after(async () => {
    const ws = await getWorkspaceName(workspaceId)
    await createNotification({
      userId,
      type,
      actorId,
      workspaceId,
      data: { actorName, resourceName: ws?.name ?? "a workspace", role },
    })
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, userId } = await params
  const role = await getWorkspaceRole(id, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Owners remove anyone; members may remove themselves (leave).
  if (role !== "owner" && userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const deleted = await removeWorkspaceMember(id, userId)

  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Only notify when an owner removed someone — not when a member leaves.
  if (userId !== session.user.id)
    notifyMember(
      "workspace_removed",
      userId,
      id,
      session.user.id,
      session.user.name
    )
  return new NextResponse(null, { status: 204 })
}
