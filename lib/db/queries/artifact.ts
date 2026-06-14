import { and, asc, desc, eq, inArray } from "drizzle-orm"

import { db } from "@/lib/db"
import { artifact, artifactCollection, artifactFolder } from "@/lib/db/schema"

function artifactOrderBy(sort: string | null) {
  return sort === "name"
    ? asc(artifact.title)
    : sort === "created"
      ? desc(artifact.createdAt)
      : desc(artifact.updatedAt)
}

export function listActiveArtifacts({
  workspaceId,
  sort = null,
  restrictIds = null,
}: {
  workspaceId: string
  sort?: string | null
  restrictIds?: string[] | null
}) {
  return db
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
    .where(
      and(
        eq(artifact.workspaceId, workspaceId),
        eq(artifact.isArchived, false),
        ...(restrictIds ? [inArray(artifact.id, restrictIds)] : [])
      )
    )
    .orderBy(artifactOrderBy(sort))
}

export function listArtifactsByIds(workspaceId: string, ids: string[]) {
  return db
    .select({
      id: artifact.id,
      title: artifact.title,
      workspaceId: artifact.workspaceId,
      isArchived: artifact.isArchived,
      createdAt: artifact.createdAt,
      updatedAt: artifact.updatedAt,
    })
    .from(artifact)
    .where(
      and(eq(artifact.workspaceId, workspaceId), inArray(artifact.id, ids))
    )
    .orderBy(artifact.updatedAt)
}

export async function getArtifactContentsByIds(
  workspaceId: string,
  ids: string[]
) {
  if (!ids.length) return []
  return db
    .select({
      id: artifact.id,
      title: artifact.title,
      content: artifact.content,
    })
    .from(artifact)
    .where(
      and(
        eq(artifact.workspaceId, workspaceId),
        eq(artifact.isArchived, false),
        inArray(artifact.id, ids)
      )
    )
}

export async function getArtifactLinksForIds(ids: string[]) {
  if (!ids.length) {
    return {
      folderLinks: [] as { artifactId: string; folderId: string }[],
      collectionLinks: [] as { artifactId: string; collectionId: string }[],
    }
  }
  const [folderLinks, collectionLinks] = await Promise.all([
    db
      .select()
      .from(artifactFolder)
      .where(inArray(artifactFolder.artifactId, ids)),
    db
      .select()
      .from(artifactCollection)
      .where(inArray(artifactCollection.artifactId, ids)),
  ])
  return { folderLinks, collectionLinks }
}

export async function getArtifactLinks(artifactId: string) {
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

export async function getArtifact(workspaceId: string, artifactId: string) {
  const [art] = await db
    .select()
    .from(artifact)
    .where(
      and(eq(artifact.id, artifactId), eq(artifact.workspaceId, workspaceId))
    )
  return art ?? null
}

export async function artifactInWorkspace(
  workspaceId: string,
  artifactId: string
) {
  const [art] = await db
    .select({ id: artifact.id })
    .from(artifact)
    .where(
      and(eq(artifact.id, artifactId), eq(artifact.workspaceId, workspaceId))
    )
  return !!art
}

export async function getArtifactTitle(
  workspaceId: string,
  artifactId: string
) {
  const [art] = await db
    .select({ id: artifact.id, title: artifact.title })
    .from(artifact)
    .where(
      and(eq(artifact.id, artifactId), eq(artifact.workspaceId, workspaceId))
    )
  return art ?? null
}

export async function getArtifactWorkspaceId(artifactId: string) {
  const [art] = await db
    .select({ workspaceId: artifact.workspaceId })
    .from(artifact)
    .where(eq(artifact.id, artifactId))
  return art?.workspaceId ?? null
}

export async function getArtifactRef(artifactId: string) {
  const [art] = await db
    .select({ id: artifact.id, workspaceId: artifact.workspaceId })
    .from(artifact)
    .where(eq(artifact.id, artifactId))
  return art ?? null
}

export async function getPublicArtifact(artifactId: string) {
  const [art] = await db
    .select({
      id: artifact.id,
      title: artifact.title,
      content: artifact.content,
      updatedAt: artifact.updatedAt,
    })
    .from(artifact)
    .where(
      and(
        eq(artifact.id, artifactId),
        eq(artifact.isPublic, true),
        eq(artifact.isArchived, false)
      )
    )
  return art ?? null
}

export async function userHasActiveArtifact(userId: string) {
  const [art] = await db
    .select({ id: artifact.id })
    .from(artifact)
    .where(and(eq(artifact.ownerId, userId), eq(artifact.isArchived, false)))
    .limit(1)
  return !!art
}

export async function deleteArtifact(workspaceId: string, artifactId: string) {
  const [deleted] = await db
    .delete(artifact)
    .where(
      and(eq(artifact.id, artifactId), eq(artifact.workspaceId, workspaceId))
    )
    .returning()
  return deleted ?? null
}

export async function createArtifactWithLinks({
  workspaceId,
  ownerId,
  title,
  content,
  folderIds,
  collectionIds,
}: {
  workspaceId: string
  ownerId: string
  title: string
  content: string | null
  folderIds: string[]
  collectionIds: string[]
}) {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(artifact)
      .values({ title, content, workspaceId, ownerId })
      .returning()

    if (folderIds.length) {
      await tx
        .insert(artifactFolder)
        .values(folderIds.map((folderId) => ({ artifactId: row.id, folderId })))
    }
    if (collectionIds.length) {
      await tx.insert(artifactCollection).values(
        collectionIds.map((collectionId) => ({
          artifactId: row.id,
          collectionId,
        }))
      )
    }
    return row
  })
}

export async function updateArtifactWithLinks({
  workspaceId,
  artifactId,
  scalarPatch,
  folderIds,
  collectionIds,
}: {
  workspaceId: string
  artifactId: string
  scalarPatch: Partial<typeof artifact.$inferInsert>
  folderIds: string[] | null
  collectionIds: string[] | null
}) {
  const hasScalarPatch = Object.keys(scalarPatch).length > 0

  return db.transaction(async (tx) => {
    let row: typeof artifact.$inferSelect | undefined

    if (hasScalarPatch) {
      const [r] = await tx
        .update(artifact)
        .set(scalarPatch)
        .where(
          and(
            eq(artifact.id, artifactId),
            eq(artifact.workspaceId, workspaceId)
          )
        )
        .returning()
      if (!r) return null
      row = r
    } else {
      const [r] = await tx
        .select()
        .from(artifact)
        .where(
          and(
            eq(artifact.id, artifactId),
            eq(artifact.workspaceId, workspaceId)
          )
        )
      if (!r) return null
      row = r
    }

    if (folderIds) {
      await tx
        .delete(artifactFolder)
        .where(eq(artifactFolder.artifactId, row.id))
      if (folderIds.length) {
        await tx
          .insert(artifactFolder)
          .values(
            folderIds.map((folderId) => ({ artifactId: row.id, folderId }))
          )
      }
    }
    if (collectionIds) {
      await tx
        .delete(artifactCollection)
        .where(eq(artifactCollection.artifactId, row.id))
      if (collectionIds.length) {
        await tx.insert(artifactCollection).values(
          collectionIds.map((collectionId) => ({
            artifactId: row.id,
            collectionId,
          }))
        )
      }
    }
    return row
  })
}
