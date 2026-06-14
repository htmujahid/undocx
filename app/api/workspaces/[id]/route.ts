import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import {
  countOwnedWorkspaces,
  deleteOwnedWorkspace,
  updateWorkspaceName,
} from "@/lib/db/queries/workspace"

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

  const updated = await updateWorkspaceName(id, session.user.id, name.trim())

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

  const total = await countOwnedWorkspaces(session.user.id)
  if (total <= 1) {
    return NextResponse.json(
      { error: "Cannot delete the last workspace" },
      { status: 409 }
    )
  }

  const deleted = await deleteOwnedWorkspace(id, session.user.id)

  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
