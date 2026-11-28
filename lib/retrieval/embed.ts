import "server-only";

import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";

export const embeddingModel = "text-embedding-3-small";

export async function embedWithUsage(values: string[], signal?: AbortSignal) {
  if (values.length === 0) return { embeddings: [], tokens: 0 };
  const { embeddings, usage } = await embedMany({ model: openai.embedding(embeddingModel), values, abortSignal: signal });
  return { embeddings, tokens: usage.tokens };
}

export async function embedTexts(values: string[], signal?: AbortSignal) {
  return (await embedWithUsage(values, signal)).embeddings;
}
