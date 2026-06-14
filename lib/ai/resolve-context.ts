import { openai } from "@ai-sdk/openai"
import { embed } from "ai"

import type { ContextDocument } from "@/lib/ai/ai-schema"
import { getSharedArtifacts, getWorkspaceRole } from "@/lib/db/queries/access"
import { getArtifactContentsByIds } from "@/lib/db/queries/artifact"
import { searchChunksInArtifacts } from "@/lib/db/queries/artifact-chunk"

const approxTokens = (text: string) => Math.ceil(text.length / 4)

const FULL_CONTEXT_TOKEN_BUDGET = 8000

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

  if (totalTokens <= FULL_CONTEXT_TOKEN_BUDGET || !query.trim()) {
    return docs.map((d) => ({ title: d.title, content: d.content }))
  }

  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  })
  const chunks = await searchChunksInArtifacts(
    docs.map((d) => d.id),
    embedding
  )

  if (chunks.length === 0) {
    return docs.map((d) => ({ title: d.title, content: d.content }))
  }

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
