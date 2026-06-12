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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const folders = await db
    .select()
    .from(folder)
    .where(eq(folder.workspaceId, id))
    .orderBy(folder.createdAt)

  return NextResponse.json(folders)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { name, parentId } = await req.json()
  if (!name?.trim())
    return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const [created] = await db
    .insert(folder)
    .values({ name: name.trim(), workspaceId: id, parentId: parentId ?? null })
    .returning()

  return NextResponse.json(created, { status: 201 })
}
