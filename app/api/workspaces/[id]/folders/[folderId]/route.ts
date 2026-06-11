import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { folder, workspace } from "@/lib/db/schema"

async function verifyWorkspaceOwner(workspaceId: string, userId: string) {
  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(and(eq(workspace.id, workspaceId), eq(workspace.ownerId, userId)))
  return ws ?? null
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; folderId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, folderId } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const patch: Record<string, unknown> = {}
  if (body.name !== undefined) {
    if (!body.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })
    patch.name = body.name.trim()
  }
  if ("parentId" in body) patch.parentId = body.parentId ?? null

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })

  const [updated] = await db
    .update(folder)
    .set(patch)
    .where(and(eq(folder.id, folderId), eq(folder.workspaceId, id)))
    .returning()

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; folderId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, folderId } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [deleted] = await db
    .delete(folder)
    .where(and(eq(folder.id, folderId), eq(folder.workspaceId, id)))
    .returning()

  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
