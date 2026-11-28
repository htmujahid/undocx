import "server-only";

import { and, asc, count, eq, inArray, sql } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "~@/lib/db";
import { document, documentTag, folder, tag } from "~@/lib/db/schema";

const duplicate = "23505";

function isDuplicate(error: unknown) {
  return (error as { cause?: { code?: string } }).cause?.code === duplicate;
}

export async function listFolders(userId: string) {
  await connection();
  return db
    .select({ id: folder.id, name: folder.name, documents: count(document.id) })
    .from(folder)
    .leftJoin(document, eq(document.folderId, folder.id))
    .where(eq(folder.userId, userId))
    .groupBy(folder.id)
    .orderBy(asc(sql`lower(${folder.name})`));
}

export async function listTags(userId: string) {
  await connection();
  return db
    .select({ id: tag.id, name: tag.name, documents: count(documentTag.documentId) })
    .from(tag)
    .leftJoin(documentTag, eq(documentTag.tagId, tag.id))
    .where(eq(tag.userId, userId))
    .groupBy(tag.id)
    .orderBy(asc(sql`lower(${tag.name})`));
}

export async function countDocumentsByFolder(userId: string) {
  const [row] = await db
    .select({ all: count(), unfiled: sql<number>`count(*) filter (where ${document.folderId} is null)`.mapWith(Number) })
    .from(document)
    .where(eq(document.userId, userId));
  return row;
}

export async function countFolders(userId: string) {
  const [{ total }] = await db.select({ total: count() }).from(folder).where(eq(folder.userId, userId));
  return total;
}

export async function insertFolder(userId: string, name: string) {
  const [row] = await db.insert(folder).values({ userId, name }).onConflictDoNothing().returning({ id: folder.id });
  return row?.id ?? null;
}

export async function renameFolder(userId: string, id: string, name: string) {
  try {
    const rows = await db.update(folder).set({ name }).where(and(eq(folder.id, id), eq(folder.userId, userId))).returning({ id: folder.id });
    return rows.length > 0 ? "ok" : "missing";
  } catch (error) {
    if (isDuplicate(error)) return "duplicate";
    throw error;
  }
}

export async function removeFolder(userId: string, id: string) {
  await db.delete(folder).where(and(eq(folder.id, id), eq(folder.userId, userId)));
}

export async function moveDocument(userId: string, documentId: string, folderId: string | null) {
  if (folderId) {
    const [owned] = await db.select({ id: folder.id }).from(folder).where(and(eq(folder.id, folderId), eq(folder.userId, userId)));
    if (!owned) return false;
  }
  const rows = await db.update(document).set({ folderId }).where(and(eq(document.id, documentId), eq(document.userId, userId))).returning({ id: document.id });
  return rows.length > 0;
}

export async function countTags(userId: string) {
  const [{ total }] = await db.select({ total: count() }).from(tag).where(eq(tag.userId, userId));
  return total;
}

export async function listDocumentTagNames(userId: string, names: string[]) {
  if (names.length === 0) return [];
  return db
    .select({ name: tag.name })
    .from(tag)
    .where(and(eq(tag.userId, userId), inArray(sql`lower(${tag.name})`, names.map((name) => name.toLowerCase()))));
}

export async function setDocumentTags(userId: string, documentId: string, names: string[]) {
  return db.transaction(async (tx) => {
    const [owned] = await tx.select({ id: document.id }).from(document).where(and(eq(document.id, documentId), eq(document.userId, userId)));
    if (!owned) return false;
    if (names.length > 0) await tx.insert(tag).values(names.map((name) => ({ userId, name }))).onConflictDoNothing();
    const rows =
      names.length > 0
        ? await tx
            .select({ id: tag.id })
            .from(tag)
            .where(and(eq(tag.userId, userId), inArray(sql`lower(${tag.name})`, names.map((name) => name.toLowerCase()))))
        : [];
    await tx.delete(documentTag).where(eq(documentTag.documentId, documentId));
    if (rows.length > 0) await tx.insert(documentTag).values(rows.map((row) => ({ documentId, tagId: row.id })));
    await tx.delete(tag).where(and(eq(tag.userId, userId), sql`not exists (select 1 from ${documentTag} where ${documentTag.tagId} = ${tag.id})`));
    return true;
  });
}
