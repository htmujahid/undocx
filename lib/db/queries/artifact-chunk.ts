import { and, eq, inArray, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { artifact, artifactChunk } from "@/lib/db/schema"

function vectorLiteral(embedding: number[]) {
  return `[${embedding.join(",")}]`
}

// Nearest chunks (cosine distance) across a workspace's active artifacts.
export function searchWorkspaceChunks(
  workspaceId: string,
  embedding: number[],
  limit = 6
) {
  const vectorString = vectorLiteral(embedding)
  return db
    .select({
      content: artifactChunk.content,
      heading: artifactChunk.heading,
      artifactTitle: artifact.title,
    })
    .from(artifactChunk)
    .innerJoin(artifact, eq(artifactChunk.artifactId, artifact.id))
    .where(
      and(eq(artifact.workspaceId, workspaceId), eq(artifact.isArchived, false))
    )
    .orderBy(sql`${artifactChunk.embedding} <=> ${vectorString}::vector`)
    .limit(limit)
}

// Nearest chunks (cosine distance) within a specific set of artifacts. Used to
// scope retrieval to the reference documents a user explicitly selected.
export function searchChunksInArtifacts(
  artifactIds: string[],
  embedding: number[],
  limit = 8
) {
  if (artifactIds.length === 0) return Promise.resolve([])
  const vectorString = vectorLiteral(embedding)
  return db
    .select({
      content: artifactChunk.content,
      heading: artifactChunk.heading,
      artifactTitle: artifact.title,
    })
    .from(artifactChunk)
    .innerJoin(artifact, eq(artifactChunk.artifactId, artifact.id))
    .where(inArray(artifactChunk.artifactId, artifactIds))
    .orderBy(sql`${artifactChunk.embedding} <=> ${vectorString}::vector`)
    .limit(limit)
}

// Nearest chunks across a user's public, active artifacts.
export function searchPublicUserChunks(
  userId: string,
  embedding: number[],
  limit = 6
) {
  const vectorString = vectorLiteral(embedding)
  return db
    .select({
      content: artifactChunk.content,
      heading: artifactChunk.heading,
      artifactTitle: artifact.title,
    })
    .from(artifactChunk)
    .innerJoin(artifact, eq(artifactChunk.artifactId, artifact.id))
    .where(
      and(
        eq(artifact.ownerId, userId),
        eq(artifact.isPublic, true),
        eq(artifact.isArchived, false)
      )
    )
    .orderBy(sql`${artifactChunk.embedding} <=> ${vectorString}::vector`)
    .limit(limit)
}
