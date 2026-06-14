import { and, eq, inArray } from "drizzle-orm"

import { db } from "@/lib/db"
import { collection } from "@/lib/db/schema"

const DEFAULT_COLLECTION_COLOR = "#6366f1"

export function listWorkspaceCollections(workspaceId: string) {
  return db
    .select()
    .from(collection)
    .where(eq(collection.workspaceId, workspaceId))
    .orderBy(collection.createdAt)
}

export async function createCollection(
  workspaceId: string,
  name: string,
  color?: string | null
) {
  const [created] = await db
    .insert(collection)
    .values({
      name,
      color: color ?? DEFAULT_COLLECTION_COLOR,
      workspaceId,
    })
    .returning()
  return created
}

export async function updateCollection(
  id: string,
  workspaceId: string,
  { name, color }: { name: string; color?: string | null }
) {
  const [updated] = await db
    .update(collection)
    .set({ name, ...(color && { color }) })
    .where(and(eq(collection.id, id), eq(collection.workspaceId, workspaceId)))
    .returning()
  return updated ?? null
}

export async function deleteCollection(id: string, workspaceId: string) {
  const [deleted] = await db
    .delete(collection)
    .where(and(eq(collection.id, id), eq(collection.workspaceId, workspaceId)))
    .returning()
  return deleted ?? null
}

export async function filterWorkspaceCollectionIds(
  workspaceId: string,
  ids: unknown
) {
  if (!Array.isArray(ids) || ids.length === 0) return []
  const rows = await db
    .select({ id: collection.id })
    .from(collection)
    .where(
      and(eq(collection.workspaceId, workspaceId), inArray(collection.id, ids))
    )
  return rows.map((r) => r.id)
}
