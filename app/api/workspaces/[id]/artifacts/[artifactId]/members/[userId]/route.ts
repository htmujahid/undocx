import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { getWorkspaceRole } from "@/lib/db/access"
import {
  MEMBER_ROLES,
  type MemberRole,
  artifact,
  artifactMember,
} from "@/lib/db/schema"

async function artifactInWorkspace(workspaceId: string, artifactId: string) {
  const [art] = await db
    .select({ id: artifact.id })
    .from(artifact)
    .where(and(eq(artifact.id, artifactId), eq(artifact.workspaceId, workspaceId)))
  return !!art
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; artifactId: string; userId: string }> }
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

  const [updated] = await db
    .update(artifactMember)
    .set({ role: newRole })
    .where(
      and(
        eq(artifactMember.artifactId, artifactId),
        eq(artifactMember.userId, userId)
      )
    )
    .returning()

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; artifactId: string; userId: string }> }
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

  const [deleted] = await db
    .delete(artifactMember)
    .where(
      and(
        eq(artifactMember.artifactId, artifactId),
        eq(artifactMember.userId, userId)
      )
    )
    .returning()

  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
