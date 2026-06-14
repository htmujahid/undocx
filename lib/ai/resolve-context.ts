import { openai } from "@ai-sdk/openai"
import { embed } from "ai"

import type { ContextDocument } from "@/lib/ai/ai-schema"
import { getSharedArtifacts, getWorkspaceRole } from "@/lib/db/queries/access"
import { getArtifactContentsByIds } from "@/lib/db/queries/artifact"
import { searchChunksInArtifacts } from "@/lib/db/queries/artifact-chunk"

// Rough token estimate (~4 chars/token), used only to choose a strategy.
const approxTokens = (text: string) => Math.ceil(text.length / 4)

// Combined size below which selected documents are sent whole. Above it we fall
// back to scoped retrieval so a few large references can't blow up the prompt.
const FULL_CONTEXT_TOKEN_BUDGET = 8000

/**
 * Resolves the user-selected reference artifacts into prompt context.
 *
 * Hybrid strategy:
 *  - Small selections are sent in full, so the model sees complete documents
 *    (better for an explicit, hand-picked set).
 *  - Large selections fall back to scoped RAG: only the chunks most relevant to
 *    `query`, retrieved from within the selected artifacts, are returned.
 *
 * Access is enforced here — only artifacts the user can read are ever loaded.
 */
export async function resolveContextDocuments({
  workspaceId,
  userId,
  contextIds,
  query,
}: {
  workspaceId: string
  userId: string
  contextIds: string[]
  query: string
}): Promise<ContextDocument[]> {
  if (!contextIds.length) return []

  // Workspace members can read every artifact in the workspace; artifact-only
  // collaborators are limited to the artifacts shared directly with them.
  const role = await getWorkspaceRole(workspaceId, userId)
  let allowedIds = contextIds
  if (!role) {
    const shared = new Set(
      (await getSharedArtifacts(workspaceId, userId)).map((s) => s.artifactId)
    )
    allowedIds = contextIds.filter((id) => shared.has(id))
  }
  if (!allowedIds.length) return []

  const docs = (await getArtifactContentsByIds(workspaceId, allowedIds))
    .map((d) => ({ ...d, content: d.content ?? "" }))
    .filter((d) => d.content.trim())
  if (docs.length === 0) return []

  const totalTokens = docs.reduce((sum, d) => sum + approxTokens(d.content), 0)

  // Small enough (or no query to rank against): send the whole documents.
  if (totalTokens <= FULL_CONTEXT_TOKEN_BUDGET || !query.trim()) {
    return docs.map((d) => ({ title: d.title, content: d.content }))
  }

  // Too large: retrieve the most relevant chunks within the selected docs.
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  })
  const chunks = await searchChunksInArtifacts(
    docs.map((d) => d.id),
    embedding
  )

  // No embeddings indexed yet — degrade gracefully to full content.
  if (chunks.length === 0) {
    return docs.map((d) => ({ title: d.title, content: d.content }))
  }

  // Regroup the retrieved chunks into one document per artifact.
  const byTitle = new Map<string, string[]>()
  for (const chunk of chunks) {
    const body = chunk.heading
      ? `## ${chunk.heading}\n\n${chunk.content}`
      : chunk.content
    const parts = byTitle.get(chunk.artifactTitle) ?? []
    parts.push(body)
    byTitle.set(chunk.artifactTitle, parts)
  }
  return [...byTitle].map(([title, parts]) => ({
    title,
    content: parts.join("\n\n"),
  }))
}
