import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { canEdit, getWorkspaceRole } from "@/lib/db/queries/access"
import { deleteFolder, updateFolder } from "@/lib/db/queries/folder"
import { type folder } from "@/lib/db/schema"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; folderId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, folderId } = await params
  const role = await getWorkspaceRole(id, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!canEdit(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const patch: Partial<typeof folder.$inferInsert> = {}
  if (body.name !== undefined) {
    if (!body.name?.trim())
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    patch.name = body.name.trim()
  }
  if ("parentId" in body) patch.parentId = body.parentId ?? null

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })

  const updated = await updateFolder(folderId, id, patch)

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; folderId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, folderId } = await params
  const role = await getWorkspaceRole(id, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!canEdit(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const deleted = await deleteFolder(folderId, id)

  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
