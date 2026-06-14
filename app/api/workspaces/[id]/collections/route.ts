import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import {
  canEdit,
  getWorkspaceAccess,
  getWorkspaceRole,
} from "@/lib/db/queries/access"
import {
  createCollection,
  listWorkspaceCollections,
} from "@/lib/db/queries/collection"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const access = await getWorkspaceAccess(id, session.user.id)
  if (!access) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!access.role) return NextResponse.json([])

  const collections = await listWorkspaceCollections(id)

  return NextResponse.json(collections)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const role = await getWorkspaceRole(id, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!canEdit(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { name, color } = await req.json()
  if (!name?.trim())
    return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const created = await createCollection(id, name.trim(), color)

  return NextResponse.json(created, { status: 201 })
}
