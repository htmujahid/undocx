import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { workspace } from "@/lib/db/schema"

export async function GET() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const workspaces = await db
    .select()
    .from(workspace)
    .where(eq(workspace.ownerId, session.user.id))
    .orderBy(workspace.createdAt)

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

  return NextResponse.json(created, { status: 201 })
}
