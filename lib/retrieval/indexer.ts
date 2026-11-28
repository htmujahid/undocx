import "server-only";

import { createHash } from "node:crypto";
import { getEntitlement, usageSince } from "~@/lib/db/repository/billing";
import { insertRun } from "~@/lib/db/repository/ai";
import { costMicros } from "~@/lib/billing/pricing";
import { countStaleDocuments, listChunkVectors, listStaleDocuments, loadDocumentForIndexing, markIndexed, replaceChunks } from "~@/lib/db/repository/retrieval";
import { chunkDocument, embeddingInput } from "./chunk";
import { embeddingModel, embedWithUsage } from "./embed";

async function indexDocument(userId: string, documentId: string) {
  const doc = await loadDocumentForIndexing(userId, documentId);
  if (!doc) return 0;
  const chunks = chunkDocument(doc.content, doc.title);
  const hash = createHash("sha256")
    .update([embeddingModel, doc.title, ...chunks.map((chunk) => chunk.hash)].join("|"))
    .digest("hex");
  if (hash === doc.indexedHash) {
    await markIndexed(documentId, doc.version, hash);
    return 0;
  }
  const known = new Map((await listChunkVectors(documentId)).filter((row) => row.embeddingModel === embeddingModel).map((row) => [row.contentHash, row.embedding]));
  const missing = chunks.filter((chunk) => !known.has(chunk.hash));
  const { embeddings, tokens } = await embedWithUsage(missing.map((chunk) => embeddingInput(doc.title, chunk)));
  missing.forEach((chunk, index) => known.set(chunk.hash, embeddings[index]));
  await replaceChunks(
    userId,
    documentId,
    embeddingModel,
    chunks.map(({ hash: contentHash, ...chunk }) => ({ ...chunk, contentHash, embedding: known.get(contentHash)! })),
  );
  await markIndexed(documentId, doc.version, hash);
  return tokens;
}

export async function refreshIndex(userId: string, { budgetMs = 20_000 }: { budgetMs?: number } = {}) {
  const { limits, window } = await getEntitlement(userId);
  if ((await usageSince(userId, window.start)) >= limits.allowanceMicros) return { updated: 0, remaining: await countStaleDocuments(userId), blocked: true };
  const startedAt = Date.now();
  let updated = 0;
  let tokens = 0;
  for (const id of await listStaleDocuments(userId, 200)) {
    if (Date.now() - startedAt > budgetMs) break;
    try {
      tokens += await indexDocument(userId, id);
      updated++;
    } catch (error) {
      console.error("[retrieval:index]", error);
    }
  }
  if (tokens > 0) {
    await insertRun({ userId, kind: "index", model: embeddingModel, status: "ok", inputTokens: tokens, totalTokens: tokens, costMicros: costMicros(embeddingModel, { inputTokens: tokens }), durationMs: Date.now() - startedAt });
  }
  return { updated, remaining: await countStaleDocuments(userId), blocked: false };
}
