import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { artifact, artifactFavorite, workspace } from "@/lib/db/schema"

async function verifyWorkspaceOwner(workspaceId: string, userId: string) {
  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(and(eq(workspace.id, workspaceId), eq(workspace.ownerId, userId)))
  return ws ?? null
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, artifactId } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [art] = await db
    .select({ id: artifact.id })
    .from(artifact)
    .where(and(eq(artifact.id, artifactId), eq(artifact.workspaceId, id)))
  if (!art) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [existing] = await db
    .select()
    .from(artifactFavorite)
    .where(
      and(eq(artifactFavorite.userId, session.user.id), eq(artifactFavorite.artifactId, artifactId))
    )

  if (existing) {
    await db
      .delete(artifactFavorite)
      .where(
        and(
          eq(artifactFavorite.userId, session.user.id),
          eq(artifactFavorite.artifactId, artifactId)
        )
      )
    return NextResponse.json({ isFavorited: false })
  }

  await db.insert(artifactFavorite).values({ userId: session.user.id, artifactId })
  return NextResponse.json({ isFavorited: true })
}
