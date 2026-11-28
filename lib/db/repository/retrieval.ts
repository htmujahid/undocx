import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "~@/lib/db";
import { document, documentChunk, indexJob } from "~@/lib/db/schema";

export type NewChunk = {
  position: number;
  blockStart: number;
  blockEnd: number;
  headingPath: string;
  text: string;
  contentHash: string;
  embedding: number[];
};

export type ClaimedJob = { documentId: string; userId: string; requestedAt: string };

export async function requestIndexing(userId: string, documentId: string) {
  await db
    .insert(indexJob)
    .values({ documentId, userId })
    .onConflictDoUpdate({ target: indexJob.documentId, set: { requestedAt: new Date(), lockedAt: null, attempts: 0, error: null } });
}

export async function enqueueUnindexed(userId?: string) {
  await db.execute(sql`
    insert into index_job (document_id, user_id)
    select d.id, d.user_id from document d
    where d.plain_text <> ''
      ${userId ? sql`and d.user_id = ${userId}` : sql``}
      and not exists (select 1 from document_chunk c where c.document_id = d.id)
      and not exists (select 1 from index_job j where j.document_id = d.id)
    on conflict do nothing
  `);
}

export async function claimJobs({ quietSeconds, limit, userId }: { quietSeconds: number; limit: number; userId?: string }) {
  const result = await db.execute<{ document_id: string; user_id: string; requested_at: string }>(sql`
    update index_job set locked_at = now(), attempts = attempts + 1
    where document_id in (
      select document_id from index_job
      where requested_at <= now() - make_interval(secs => ${quietSeconds})
        and (locked_at is null or locked_at < now() - interval '5 minutes')
        and attempts < 5
        ${userId ? sql`and user_id = ${userId}` : sql``}
      order by requested_at
      limit ${limit}
      for update skip locked
    )
    returning document_id, user_id, requested_at::text as requested_at
  `);
  return result.rows.map((row) => ({ documentId: row.document_id, userId: row.user_id, requestedAt: row.requested_at }));
}

export async function finishJob(job: ClaimedJob) {
  await db.execute(sql`delete from index_job where document_id = ${job.documentId} and requested_at = ${job.requestedAt}::timestamp`);
}

export async function failJob(documentId: string, error: string) {
  await db.update(indexJob).set({ lockedAt: null, error: error.slice(0, 500) }).where(eq(indexJob.documentId, documentId));
}

export async function loadDocumentForIndexing(userId: string, documentId: string) {
  const [row] = await db
    .select({ title: document.title, content: document.content })
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
