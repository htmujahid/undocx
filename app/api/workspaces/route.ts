import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { workspace, workspaceMember } from "@/lib/db/schema"

export async function GET() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [owned, memberships] = await Promise.all([
    db
      .select()
      .from(workspace)
      .where(eq(workspace.ownerId, session.user.id)),
    db
      .select({ workspace: workspace, role: workspaceMember.role })
      .from(workspaceMember)
      .innerJoin(workspace, eq(workspace.id, workspaceMember.workspaceId))
      .where(eq(workspaceMember.userId, session.user.id)),
  ])

  const workspaces = [
    ...owned.map((ws) => ({ ...ws, role: "owner" as const })),
    ...memberships.map(({ workspace: ws, role }) => ({ ...ws, role })),
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

  return NextResponse.json(workspaces)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const [created] = await db
    .insert(workspace)
    .values({ name: name.trim(), ownerId: session.user.id })
    .returning()

  return NextResponse.json({ ...created, role: "owner" }, { status: 201 })
}
