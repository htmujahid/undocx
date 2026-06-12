import { and, asc, desc, eq, inArray } from "drizzle-orm"
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ws = await verifyWorkspaceOwner(id, session.user.id)
  if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const sort = new URL(req.url).searchParams.get("sort")
  const orderBy =
    sort === "name"
      ? asc(artifact.title)
      : sort === "created"
        ? desc(artifact.createdAt)
        : desc(artifact.updatedAt)

  const artifacts = await db
    .select({
      id: artifact.id,
      title: artifact.title,
      workspaceId: artifact.workspaceId,
      isArchived: artifact.isArchived,
      isPublic: artifact.isPublic,
      createdAt: artifact.createdAt,
      updatedAt: artifact.updatedAt,
    })
    .from(artifact)
    .where(and(eq(artifact.workspaceId, id), eq(artifact.isArchived, false)))
    .orderBy(orderBy)

  const artifactIds = artifacts.map((a) => a.id)
  const [folderLinks, collectionLinks] = artifactIds.length
    ? await Promise.all([
        db
          .select()
          .from(artifactFolder)
          .where(inArray(artifactFolder.artifactId, artifactIds)),
        db
          .select()
          .from(artifactCollection)
          .where(inArray(artifactCollection.artifactId, artifactIds)),
      ])
    : [[], []]

  const result = artifacts.map((a) => ({
    ...a,
    folderIds: folderLinks
      .filter((l) => l.artifactId === a.id)
      .map((l) => l.folderId),
    collectionIds: collectionLinks
      .filter((l) => l.artifactId === a.id)
      .map((l) => l.collectionId),
  }))

  return NextResponse.json(result)
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

  const { title, content, folderIds, collectionIds } = await req.json()
  if (!title?.trim())
    return NextResponse.json({ error: "Title is required" }, { status: 400 })

  const validFolderIds = await filterWorkspaceFolderIds(id, folderIds)
  const validCollectionIds = await filterWorkspaceCollectionIds(
    id,
    collectionIds
  )

  const created = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(artifact)
      .values({
        title: title.trim(),
        content: content ?? null,
        workspaceId: id,
      })
      .returning()

    if (validFolderIds.length) {
      await tx
        .insert(artifactFolder)
        .values(
          validFolderIds.map((folderId) => ({ artifactId: row.id, folderId }))
        )
    }
    if (validCollectionIds.length) {
      await tx.insert(artifactCollection).values(
        validCollectionIds.map((collectionId) => ({
          artifactId: row.id,
          collectionId,
        }))
      )
    }
    return row
  })

  return NextResponse.json(
    {
      ...created,
      folderIds: validFolderIds,
      collectionIds: validCollectionIds,
    },
    { status: 201 }
  )
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
