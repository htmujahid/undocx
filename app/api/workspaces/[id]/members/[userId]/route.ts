import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { getWorkspaceRole } from "@/lib/db/access"
import {
  MEMBER_ROLES,
  type MemberRole,
  workspaceMember,
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

  const [updated] = await db
    .update(workspaceMember)
    .set({ role: newRole })
    .where(
      and(
        eq(workspaceMember.workspaceId, id),
        eq(workspaceMember.userId, userId)
      )
    )
    .returning()

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
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

  const [deleted] = await db
    .delete(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, id),
        eq(workspaceMember.userId, userId)
      )
    )
    .returning()

  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
