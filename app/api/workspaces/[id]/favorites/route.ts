import { and, eq, inArray } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  artifact,
  artifactCollection,
  artifactFavorite,
  artifactFolder,
  workspace,
} from "@/lib/db/schema"

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

  const favorites = await db
    .select({ artifactId: artifactFavorite.artifactId })
    .from(artifactFavorite)
    .where(eq(artifactFavorite.userId, session.user.id))

  const favoriteIds = favorites.map((f) => f.artifactId)
  if (!favoriteIds.length) return NextResponse.json([])

  const artifacts = await db
    .select({
      id: artifact.id,
      title: artifact.title,
      workspaceId: artifact.workspaceId,
      isArchived: artifact.isArchived,
      createdAt: artifact.createdAt,
      updatedAt: artifact.updatedAt,
    })
    .from(artifact)
    .where(and(eq(artifact.workspaceId, id), inArray(artifact.id, favoriteIds)))
    .orderBy(artifact.updatedAt)

  const artifactIds = artifacts.map((a) => a.id)
  const [folderLinks, collectionLinks] = artifactIds.length
    ? await Promise.all([
        db.select().from(artifactFolder).where(inArray(artifactFolder.artifactId, artifactIds)),
        db
          .select()
          .from(artifactCollection)
          .where(inArray(artifactCollection.artifactId, artifactIds)),
      ])
    : [[], []]

  return NextResponse.json(
    artifacts.map((a) => ({
      ...a,
      folderIds: folderLinks.filter((l) => l.artifactId === a.id).map((l) => l.folderId),
      collectionIds: collectionLinks
        .filter((l) => l.artifactId === a.id)
        .map((l) => l.collectionId),
    }))
  )
}
