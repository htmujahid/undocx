import "server-only";

import { and, asc, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { connection } from "next/server";
import { requestIndexing } from "~@/lib/db/repository/retrieval";
import { db } from "~@/lib/db";
import { likePattern } from "~@/lib/db/like";
import { document, documentTag, tag } from "~@/lib/db/schema";
import { organizeLimits } from "~@/lib/documents/limits";
import type { ListQuery } from "~@/lib/documents/list-query";

export type DocumentStatus = (typeof document.$inferSelect)["status"];

const sortOrder = {
  updated: [desc(document.updatedAt), desc(document.id)],
  created: [desc(document.createdAt), desc(document.id)],
  title: [asc(sql`lower(${document.title})`), asc(document.id)],
  words: [desc(document.wordCount), desc(document.id)],
} as const;

export async function listDocuments(userId: string, query: ListQuery) {
  await connection();
  const conditions = [eq(document.userId, userId)];
  if (query.q) {
    const pattern = likePattern(query.q);
    conditions.push(or(ilike(document.title, pattern), ilike(document.plainText, pattern))!);
  }
  if (query.folder === "none") conditions.push(isNull(document.folderId));
  else if (query.folder !== "all") conditions.push(eq(document.folderId, query.folder));
  if (query.tag) conditions.push(sql`exists (select 1 from ${documentTag} where ${documentTag.documentId} = "document"."id" and ${documentTag.tagId} = ${query.tag})`);
  const where = and(...conditions);

  const [{ total }] = await db.select({ total: count() }).from(document).where(where);
  const pageCount = Math.max(1, Math.ceil(total / organizeLimits.pageSize));
  const page = Math.min(query.page, pageCount);
  const items = await db
    .select({
      id: document.id,
      title: document.title,
      status: document.status,
      wordCount: document.wordCount,
      lockedCount: document.lockedCount,
      updatedAt: document.updatedAt,
      folderId: document.folderId,
      tags: sql<{ id: string; name: string }[]>`coalesce((select json_agg(json_build_object('id', t.id, 'name', t.name) order by lower(t.name)) from ${documentTag} dt join ${tag} t on t.id = dt.tag_id where dt.document_id = "document"."id"), '[]'::json)`,
    })
    .from(document)
    .where(where)
    .orderBy(...sortOrder[query.sort])
    .limit(organizeLimits.pageSize)
    .offset((page - 1) * organizeLimits.pageSize);
  return { items, total, page, pageCount };
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
  if (rows[0]) await requestIndexing(userId, id);
  return rows[0]?.version ?? null;
}

export async function renameDocument(userId: string, id: string, title: string) {
  const rows = await db
    .update(document)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(document.id, id), eq(document.userId, userId)))
    .returning({ id: document.id });
  if (rows.length > 0) await requestIndexing(userId, id);
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

export async function updateDocumentRuleSet(userId: string, id: string, ruleSetId: string | null) {
  const rows = await db
    .update(document)
    .set({ ruleSetId })
    .where(and(eq(document.id, id), eq(document.userId, userId)))
    .returning({ id: document.id });
  return rows.length > 0;
}
