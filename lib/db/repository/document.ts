import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "~@/lib/db";
import { document } from "~@/lib/db/schema";

export type DocumentStatus = (typeof document.$inferSelect)["status"];

export async function listDocuments(userId: string) {
  await connection();
  return db
    .select({
      id: document.id,
      title: document.title,
      status: document.status,
      wordCount: document.wordCount,
      lockedCount: document.lockedCount,
      updatedAt: document.updatedAt,
    })
    .from(document)
    .where(eq(document.userId, userId))
    .orderBy(desc(document.updatedAt));
}

export async function findDocument(userId: string, id: string) {
  await connection();
  const [row] = await db
    .select()
    .from(document)
    .where(and(eq(document.id, id), eq(document.userId, userId)));
  return row ?? null;
}

export async function countDocuments(userId: string) {
  const [{ total }] = await db.select({ total: count() }).from(document).where(eq(document.userId, userId));
  return total;
}

export async function insertDocument(userId: string) {
  const [row] = await db.insert(document).values({ userId }).returning({ id: document.id });
  return row.id;
}

export async function saveDocumentContent(
  userId: string,
  id: string,
  version: number,
  fields: { content: unknown; plainText: string; wordCount: number; lockedCount: number },
) {
  const rows = await db
    .update(document)
    .set({ ...fields, contentVersion: version + 1, updatedAt: new Date() })
    .where(and(eq(document.id, id), eq(document.userId, userId), eq(document.contentVersion, version)))
    .returning({ version: document.contentVersion });
  return rows[0]?.version ?? null;
}

export async function renameDocument(userId: string, id: string, title: string) {
  const rows = await db
    .update(document)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(document.id, id), eq(document.userId, userId)))
    .returning({ id: document.id });
  return rows.length > 0;
}

export async function updateDocumentStatus(userId: string, id: string, status: DocumentStatus) {
  const rows = await db
    .update(document)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(document.id, id), eq(document.userId, userId)))
    .returning({ id: document.id });
  return rows.length > 0;
}

export async function removeDocument(userId: string, id: string) {
  await db.delete(document).where(and(eq(document.id, id), eq(document.userId, userId)));
}
