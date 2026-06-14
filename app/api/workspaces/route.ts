import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import {
  createWorkspace,
  listOwnedWorkspaces,
  listWorkspaceMemberships,
} from "@/lib/db/queries/workspace"

export async function GET() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [owned, memberships] = await Promise.all([
    listOwnedWorkspaces(session.user.id),
    listWorkspaceMemberships(session.user.id),
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

  const created = await createWorkspace(name.trim(), session.user.id)

  return NextResponse.json({ ...created, role: "owner" }, { status: 201 })
}
