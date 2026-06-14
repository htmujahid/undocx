import { and, eq, inArray } from "drizzle-orm"

import { db } from "@/lib/db"
import { folder } from "@/lib/db/schema"

export function listWorkspaceFolders(workspaceId: string) {
  return db
    .select()
    .from(folder)
    .where(eq(folder.workspaceId, workspaceId))
    .orderBy(folder.createdAt)
}

export async function createFolder(
  workspaceId: string,
  name: string,
  parentId: string | null
) {
  const [created] = await db
    .insert(folder)
    .values({ name, workspaceId, parentId: parentId ?? null })
    .returning()
  return created
}

export async function updateFolder(
  id: string,
  workspaceId: string,
  patch: Partial<typeof folder.$inferInsert>
) {
  const [updated] = await db
    .update(folder)
    .set(patch)
    .where(and(eq(folder.id, id), eq(folder.workspaceId, workspaceId)))
    .returning()
  return updated ?? null
}

export async function deleteFolder(id: string, workspaceId: string) {
  const [deleted] = await db
    .delete(folder)
    .where(and(eq(folder.id, id), eq(folder.workspaceId, workspaceId)))
    .returning()
  return deleted ?? null
}

export async function filterWorkspaceFolderIds(
  workspaceId: string,
  ids: unknown
) {
  if (!Array.isArray(ids) || ids.length === 0) return []
  const rows = await db
    .select({ id: folder.id })
    .from(folder)
    .where(and(eq(folder.workspaceId, workspaceId), inArray(folder.id, ids)))
  return rows.map((r) => r.id)
}
