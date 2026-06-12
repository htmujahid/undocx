import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { collection, workspace } from "@/lib/db/schema"

async function verifyWorkspaceOwner(workspaceId: string, userId: string) {
  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(and(eq(workspace.id, workspaceId), eq(workspace.ownerId, userId)))
  return ws ?? null
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; collectionId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, collectionId } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { name, color } = await req.json()
  if (!name?.trim())
    return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const [updated] = await db
    .update(collection)
    .set({ name: name.trim(), ...(color && { color }) })
    .where(and(eq(collection.id, collectionId), eq(collection.workspaceId, id)))
    .returning()

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; collectionId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, collectionId } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [deleted] = await db
    .delete(collection)
    .where(and(eq(collection.id, collectionId), eq(collection.workspaceId, id)))
    .returning()

  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
