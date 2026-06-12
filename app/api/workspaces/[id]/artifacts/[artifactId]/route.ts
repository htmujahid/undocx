import { and, eq, inArray } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  artifact,
  artifactCollection,
  artifactFolder,
  collection,
  folder,
  workspace,
} from "@/lib/db/schema"

async function verifyWorkspaceOwner(workspaceId: string, userId: string) {
  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(and(eq(workspace.id, workspaceId), eq(workspace.ownerId, userId)))
  return ws ?? null
}

async function getArtifactLinks(artifactId: string) {
  const [folderLinks, collectionLinks] = await Promise.all([
    db
      .select({ folderId: artifactFolder.folderId })
      .from(artifactFolder)
      .where(eq(artifactFolder.artifactId, artifactId)),
    db
      .select({ collectionId: artifactCollection.collectionId })
      .from(artifactCollection)
      .where(eq(artifactCollection.artifactId, artifactId)),
  ])
  return {
    folderIds: folderLinks.map((l) => l.folderId),
    collectionIds: collectionLinks.map((l) => l.collectionId),
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, artifactId } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [found] = await db
    .select()
    .from(artifact)
    .where(and(eq(artifact.id, artifactId), eq(artifact.workspaceId, id)))

  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const links = await getArtifactLinks(artifactId)
  return NextResponse.json({ ...found, ...links })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, artifactId } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { title, content, isArchived, isPublic, folderIds, collectionIds } =
    await req.json()
  if (title !== undefined && !title?.trim()) {
    return NextResponse.json(
      { error: "Title cannot be empty" },
      { status: 400 }
    )
  }

  const validFolderIds =
    folderIds !== undefined
      ? await filterWorkspaceFolderIds(id, folderIds)
      : null
  const validCollectionIds =
    collectionIds !== undefined
      ? await filterWorkspaceCollectionIds(id, collectionIds)
      : null

  const scalarPatch = {
    ...(title !== undefined && { title: title.trim() }),
    ...(content !== undefined && { content }),
    ...(isArchived !== undefined && { isArchived: !!isArchived }),
    ...(isPublic !== undefined && { isPublic: !!isPublic }),
  }
  const hasScalarPatch = Object.keys(scalarPatch).length > 0

  const updated = await db.transaction(async (tx) => {
    let row: typeof artifact.$inferSelect | undefined

    if (hasScalarPatch) {
      const [r] = await tx
        .update(artifact)
        .set(scalarPatch)
        .where(and(eq(artifact.id, artifactId), eq(artifact.workspaceId, id)))
        .returning()
      if (!r) return null
      row = r
    } else {
      const [r] = await tx
        .select()
        .from(artifact)
        .where(and(eq(artifact.id, artifactId), eq(artifact.workspaceId, id)))
      if (!r) return null
      row = r
    }

    if (validFolderIds) {
      await tx
        .delete(artifactFolder)
        .where(eq(artifactFolder.artifactId, row.id))
      if (validFolderIds.length) {
        await tx
          .insert(artifactFolder)
          .values(
            validFolderIds.map((folderId) => ({ artifactId: row.id, folderId }))
          )
      }
    }
    if (validCollectionIds) {
      await tx
        .delete(artifactCollection)
        .where(eq(artifactCollection.artifactId, row.id))
      if (validCollectionIds.length) {
        await tx.insert(artifactCollection).values(
          validCollectionIds.map((collectionId) => ({
            artifactId: row.id,
            collectionId,
          }))
        )
      }
    }
    return row
  })

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const links = await getArtifactLinks(artifactId)
  return NextResponse.json({ ...updated, ...links })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, artifactId } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [deleted] = await db
    .delete(artifact)
    .where(and(eq(artifact.id, artifactId), eq(artifact.workspaceId, id)))
    .returning()

  if (!deleted)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}

async function filterWorkspaceFolderIds(workspaceId: string, ids: unknown) {
  if (!Array.isArray(ids) || ids.length === 0) return []
  const rows = await db
    .select({ id: folder.id })
    .from(folder)
    .where(and(eq(folder.workspaceId, workspaceId), inArray(folder.id, ids)))
  return rows.map((r) => r.id)
}

async function filterWorkspaceCollectionIds(workspaceId: string, ids: unknown) {
  if (!Array.isArray(ids) || ids.length === 0) return []
  const rows = await db
    .select({ id: collection.id })
    .from(collection)
    .where(
      and(eq(collection.workspaceId, workspaceId), inArray(collection.id, ids))
    )
  return rows.map((r) => r.id)
}
