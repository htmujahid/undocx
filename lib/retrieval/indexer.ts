import "server-only";

import { claimJobs, enqueueUnindexed, failJob, finishJob, listChunkVectors, loadDocumentForIndexing, replaceChunks } from "~@/lib/db/repository/retrieval";
import { chunkDocument, embeddingInput } from "./chunk";
import { embeddingModel, embedTexts } from "./embed";

export async function indexDocument(userId: string, documentId: string) {
  const doc = await loadDocumentForIndexing(userId, documentId);
  if (!doc) return;
  const chunks = chunkDocument(doc.content, doc.title);
  const known = new Map((await listChunkVectors(documentId)).filter((row) => row.embeddingModel === embeddingModel).map((row) => [row.contentHash, row.embedding]));
  const missing = chunks.filter((chunk) => !known.has(chunk.hash));
  const fresh = await embedTexts(missing.map((chunk) => embeddingInput(doc.title, chunk)));
  missing.forEach((chunk, index) => known.set(chunk.hash, fresh[index]));
  await replaceChunks(
    userId,
    documentId,
    embeddingModel,
    chunks.map(({ hash, ...chunk }) => ({ ...chunk, contentHash: hash, embedding: known.get(hash)! })),
  );
}

export async function runIndexJobs({ quietSeconds, limit, userId, backfill = false }: { quietSeconds: number; limit: number; userId?: string; backfill?: boolean }) {
  if (backfill) await enqueueUnindexed(userId);
  const jobs = await claimJobs({ quietSeconds, limit, userId });
  for (const job of jobs) {
    try {
      await indexDocument(job.userId, job.documentId);
      await finishJob(job);
    } catch (error) {
      console.error("[retrieval:index]", error);
      await failJob(job.documentId, error instanceof Error ? error.message : "Indexing failed");
    }
  }
  return jobs.length;
}
