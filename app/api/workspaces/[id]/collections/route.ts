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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const collections = await db
    .select()
    .from(collection)
    .where(eq(collection.workspaceId, id))
    .orderBy(collection.createdAt)

  return NextResponse.json(collections)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { name, color } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const [created] = await db
    .insert(collection)
    .values({ name: name.trim(), color: color ?? "#6366f1", workspaceId: id })
    .returning()

  return NextResponse.json(created, { status: 201 })
}
