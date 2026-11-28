import "server-only";

import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "~@/lib/db";
import { asset, document, documentSource, source } from "~@/lib/db/schema";

export type NewSource = { kind: "file" | "text" | "link"; title: string; url?: string | null; content?: string; wordCount?: number };
export type NewAsset = { key: string; filename: string; mimeType: string; size: number };

export type SourceSearch = { query?: string; limit?: number; offset?: number; excludeDocumentId?: string };

function likePattern(query: string) {
  return `%${query.replace(/[\\%_]/g, "\\$&")}%`;
}

export async function searchSources(userId: string, { query = "", limit = 20, offset = 0, excludeDocumentId }: SourceSearch = {}) {
  await connection();
  const term = query.trim();
  const conditions = [eq(source.userId, userId)];
  if (term) {
    const pattern = likePattern(term);
    conditions.push(or(ilike(source.title, pattern), ilike(asset.filename, pattern), ilike(source.url, pattern))!);
  }
  if (excludeDocumentId) conditions.push(sql`not exists (select 1 from ${documentSource} where ${documentSource.sourceId} = ${source.id} and ${documentSource.documentId} = ${excludeDocumentId})`);
  const rows = await db
    .select({
      id: source.id,
      kind: source.kind,
      title: source.title,
      url: source.url,
      wordCount: source.wordCount,
      filename: asset.filename,
      updatedAt: source.updatedAt,
      usage: sql<number>`(select count(*) from ${documentSource} where ${documentSource.sourceId} = ${source.id})`.mapWith(Number),
    })
    .from(source)
    .leftJoin(asset, eq(asset.id, source.assetId))
    .where(and(...conditions))
    .orderBy(desc(source.updatedAt), desc(source.id))
    .limit(limit + 1)
    .offset(offset);
  return { items: rows.slice(0, limit), hasMore: rows.length > limit };
}

export async function findSource(userId: string, id: string) {
  await connection();
  const [row] = await db
    .select({ source, asset })
    .from(source)
    .leftJoin(asset, eq(asset.id, source.assetId))
    .where(and(eq(source.id, id), eq(source.userId, userId)));
  if (!row) return null;
  const documents = await db
    .select({ id: document.id, title: document.title })
    .from(documentSource)
    .innerJoin(document, eq(document.id, documentSource.documentId))
    .where(eq(documentSource.sourceId, id))
    .orderBy(desc(document.updatedAt));
  return { ...row.source, asset: row.asset, documents };
}

export async function countSources(userId: string) {
  const [{ total }] = await db.select({ total: count() }).from(source).where(eq(source.userId, userId));
  return total;
}

export async function insertSource(userId: string, fields: NewSource, file?: NewAsset) {
  return db.transaction(async (tx) => {
    let assetId: string | null = null;
    if (file) {
      const [row] = await tx.insert(asset).values({ userId, ...file }).returning({ id: asset.id });
      assetId = row.id;
    }
    const [created] = await tx
      .insert(source)
      .values({ userId, kind: fields.kind, title: fields.title, url: fields.url ?? null, content: fields.content ?? "", wordCount: fields.wordCount ?? 0, assetId })
      .returning({ id: source.id, kind: source.kind, title: source.title, url: source.url });
    return created;
  });
}

export async function renameSource(userId: string, id: string, title: string) {
  const rows = await db
    .update(source)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(source.id, id), eq(source.userId, userId)))
    .returning({ id: source.id });
  return rows.length > 0;
}

export async function removeSource(userId: string, id: string) {
  return db.transaction(async (tx) => {
    const [removed] = await tx.delete(source).where(and(eq(source.id, id), eq(source.userId, userId))).returning({ assetId: source.assetId });
    if (!removed) return null;
    if (!removed.assetId) return { assetKey: null };
    const [file] = await tx.delete(asset).where(eq(asset.id, removed.assetId)).returning({ key: asset.key });
    return { assetKey: file?.key ?? null };
  });
}

export async function listDocumentSources(userId: string, documentId: string, withContent = false) {
  await connection();
  return db
    .select({ id: source.id, kind: source.kind, title: source.title, url: source.url, wordCount: source.wordCount, content: withContent ? source.content : sql<string>`''` })
    .from(documentSource)
    .innerJoin(source, eq(source.id, documentSource.sourceId))
    .innerJoin(document, eq(document.id, documentSource.documentId))
    .where(and(eq(documentSource.documentId, documentId), eq(document.userId, userId), eq(source.userId, userId)))
    .orderBy(asc(documentSource.createdAt));
}

export async function countDocumentSources(documentId: string) {
  const [{ total }] = await db.select({ total: count() }).from(documentSource).where(eq(documentSource.documentId, documentId));
  return total;
}

export async function attachSources(userId: string, documentId: string, sourceIds: string[]) {
  if (sourceIds.length === 0) return;
  const owned = await db
    .select({ id: source.id })
    .from(source)
    .where(and(eq(source.userId, userId), inArray(source.id, sourceIds)));
  if (owned.length === 0) return;
  await db
    .insert(documentSource)
    .values(owned.map((row) => ({ documentId, sourceId: row.id })))
    .onConflictDoNothing();
}

export async function detachSource(documentId: string, sourceId: string) {
  await db.delete(documentSource).where(and(eq(documentSource.documentId, documentId), eq(documentSource.sourceId, sourceId)));
}
