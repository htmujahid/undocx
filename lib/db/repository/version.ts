import "server-only";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { connection } from "next/server";
import { requestIndexing } from "~@/lib/db/repository/retrieval";
import { db } from "~@/lib/db";
import { document, documentVersion } from "~@/lib/db/schema";

export type NewVersion = { name?: string | null; kind: "manual" | "ai" | "restore"; label?: string | null; content: unknown; wordCount: number };

async function owned(userId: string, documentId: string) {
  const [row] = await db
    .select({ id: document.id })
    .from(document)
    .where(and(eq(document.id, documentId), eq(document.userId, userId)));
  return row !== undefined;
}

export async function listVersions(userId: string, documentId: string) {
  await connection();
  if (!(await owned(userId, documentId))) return [];
  return db
    .select({ id: documentVersion.id, number: documentVersion.number, name: documentVersion.name, kind: documentVersion.kind, label: documentVersion.label, wordCount: documentVersion.wordCount, createdAt: documentVersion.createdAt })
    .from(documentVersion)
    .where(eq(documentVersion.documentId, documentId))
    .orderBy(desc(documentVersion.number));
}

export async function findVersion(userId: string, documentId: string, id: string) {
  if (!(await owned(userId, documentId))) return null;
  const [row] = await db
    .select()
    .from(documentVersion)
    .where(and(eq(documentVersion.id, id), eq(documentVersion.documentId, documentId)));
  return row ?? null;
}

export async function countVersions(documentId: string) {
  const [{ total }] = await db.select({ total: count() }).from(documentVersion).where(eq(documentVersion.documentId, documentId));
  return total;
}

export async function insertVersion(userId: string, documentId: string, fields: NewVersion, limit: number) {
  if (!(await owned(userId, documentId))) return null;
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${documentId}))`);
    const [{ total }] = await tx.select({ total: count() }).from(documentVersion).where(eq(documentVersion.documentId, documentId));
    if (total >= limit) {
      const [oldest] = await tx
        .select({ id: documentVersion.id })
        .from(documentVersion)
        .where(and(eq(documentVersion.documentId, documentId), sql`${documentVersion.kind} <> 'manual'`, sql`${documentVersion.name} is null`))
        .orderBy(asc(documentVersion.number))
        .limit(1);
      if (!oldest) return null;
      await tx.delete(documentVersion).where(eq(documentVersion.id, oldest.id));
    }
    const [{ next }] = await tx
      .select({ next: sql<number>`coalesce(max(${documentVersion.number}), 0) + 1`.mapWith(Number) })
      .from(documentVersion)
      .where(eq(documentVersion.documentId, documentId));
    const [row] = await tx
      .insert(documentVersion)
      .values({ documentId, number: next, name: fields.name || null, kind: fields.kind, label: fields.label ?? null, content: fields.content, wordCount: fields.wordCount })
      .returning({ id: documentVersion.id, number: documentVersion.number });
    return row;
  });
}

export async function renameVersion(userId: string, documentId: string, id: string, name: string | null) {
  if (!(await owned(userId, documentId))) return false;
  const rows = await db
    .update(documentVersion)
    .set({ name })
    .where(and(eq(documentVersion.id, id), eq(documentVersion.documentId, documentId)))
    .returning({ id: documentVersion.id });
  return rows.length > 0;
}

export async function removeVersion(userId: string, documentId: string, id: string) {
  if (!(await owned(userId, documentId))) return;
  await db.delete(documentVersion).where(and(eq(documentVersion.id, id), eq(documentVersion.documentId, documentId)));
}

export async function replaceDocumentContent(userId: string, documentId: string, fields: { content: unknown; plainText: string; wordCount: number; lockedCount: number }) {
  const rows = await db
    .update(document)
    .set({ ...fields, contentVersion: sql`${document.contentVersion} + 1`, updatedAt: new Date() })
    .where(and(eq(document.id, documentId), eq(document.userId, userId)))
    .returning({ version: document.contentVersion });
  if (rows[0]) await requestIndexing(userId, documentId);
  return rows[0]?.version ?? null;
}
