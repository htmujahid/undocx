import { and, count, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { workspace } from "@/lib/db/schema"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { name } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const [updated] = await db
    .update(workspace)
    .set({ name: name.trim() })
    .where(and(eq(workspace.id, id), eq(workspace.ownerId, session.user.id)))
    .returning()

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const [{ total }] = await db
    .select({ total: count() })
    .from(workspace)
    .where(eq(workspace.ownerId, session.user.id))

  if (total <= 1) {
    return NextResponse.json(
      { error: "Cannot delete the last workspace" },
      { status: 409 }
    )
  }

  const [deleted] = await db
    .delete(workspace)
    .where(and(eq(workspace.id, id), eq(workspace.ownerId, session.user.id)))
    .returning()

  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
