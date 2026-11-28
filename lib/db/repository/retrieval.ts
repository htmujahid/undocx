import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "~@/lib/db";
import { document, documentChunk } from "~@/lib/db/schema";

export type NewChunk = {
  position: number;
  blockStart: number;
  blockEnd: number;
  headingPath: string;
  text: string;
  contentHash: string;
  embedding: number[];
};

const stale = sql`(d.plain_text <> '' or d.indexed_version is not null) and d.status <> 'drafting' and d.indexed_version is distinct from d.content_version`;

export async function countStaleDocuments(userId: string) {
  const result = await db.execute<{ total: number }>(sql`select count(*)::int as total from document d where d.user_id = ${userId} and ${stale}`);
  return result.rows[0].total;
}

export async function listStaleDocuments(userId: string, limit: number) {
  const result = await db.execute<{ id: string }>(sql`select d.id from document d where d.user_id = ${userId} and ${stale} order by d.updated_at desc limit ${limit}`);
  return result.rows.map((row) => row.id);
}

export async function markIndexed(documentId: string, version: number, hash: string) {
  await db.update(document).set({ indexedVersion: version, indexedHash: hash, indexedAt: new Date() }).where(eq(document.id, documentId));
}

export async function loadDocumentForIndexing(userId: string, documentId: string) {
  const [row] = await db
    .select({ title: document.title, content: document.content, version: document.contentVersion, indexedHash: document.indexedHash })
    .from(document)
    .where(and(eq(document.id, documentId), eq(document.userId, userId)));
  return row ?? null;
}

export async function listChunkVectors(documentId: string) {
  return db
    .select({ contentHash: documentChunk.contentHash, embedding: documentChunk.embedding, embeddingModel: documentChunk.embeddingModel })
    .from(documentChunk)
    .where(eq(documentChunk.documentId, documentId));
}

export async function replaceChunks(userId: string, documentId: string, embeddingModel: string, chunks: NewChunk[]) {
  await db.transaction(async (tx) => {
    await tx.delete(documentChunk).where(eq(documentChunk.documentId, documentId));
    if (chunks.length > 0) await tx.insert(documentChunk).values(chunks.map((chunk) => ({ ...chunk, userId, documentId, embeddingModel })));
  });
}

export type ChunkHit = {
  id: string;
  documentId: string;
  title: string;
  headingPath: string;
  blockStart: number;
  text: string;
  similarity: number;
  keyword: boolean;
};

export async function searchChunks(userId: string, { vector, query, documentId, limit }: { vector: number[]; query: string; documentId?: string; limit: number }) {
  const literal = `[${vector.join(",")}]`;
  const scope = documentId ? sql`and c.document_id = ${documentId}` : sql``;
  const result = await db.execute<{ id: string; document_id: string; title: string; heading_path: string; block_start: number; text: string; similarity: number; keyword: boolean }>(sql`
    with q as (select ${literal}::halfvec(1536) as v, replace(plainto_tsquery('english', ${query})::text, '&', '|')::tsquery as t),
    semantic as (
      select c.id, row_number() over (order by c.embedding <=> q.v) as rank
      from document_chunk c, q
      where c.user_id = ${userId} ${scope}
      order by c.embedding <=> q.v
      limit 30
    ),
    lexical as (
      select c.id, row_number() over (order by ts_rank_cd(c.tsv, q.t) desc) as rank
      from document_chunk c, q
      where c.user_id = ${userId} ${scope} and c.tsv @@ q.t
      order by ts_rank_cd(c.tsv, q.t) desc
      limit 30
    ),
    fused as (
      select coalesce(s.id, l.id) as id, coalesce(1.0 / (60 + s.rank), 0) + coalesce(1.0 / (60 + l.rank), 0) as score, l.id is not null as keyword
      from semantic s full join lexical l on s.id = l.id
    )
    select c.id, c.document_id, d.title, c.heading_path, c.block_start, c.text, 1 - (c.embedding <=> q.v) as similarity, f.keyword
    from fused f
    join document_chunk c on c.id = f.id
    join document d on d.id = c.document_id
    cross join q
    order by f.score desc
    limit ${limit}
  `);
  return result.rows.map(
    (row): ChunkHit => ({
      id: row.id,
      documentId: row.document_id,
      title: row.title,
      headingPath: row.heading_path,
      blockStart: row.block_start,
      text: row.text,
      similarity: Number(row.similarity),
      keyword: row.keyword,
    }),
  );
}
