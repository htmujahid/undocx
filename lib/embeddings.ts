import { openai } from "@ai-sdk/openai"
import { embedMany } from "ai"
import { and, eq, inArray, isNull, sql } from "drizzle-orm"

import { chunkMarkdown } from "./chunking"
import { db } from "./db"
import { artifactChunk } from "./db/schema"

export async function syncArtifactChunks(
  artifactId: string,
  title: string,
  content: string | null
) {
  if (!content?.trim()) {
    await db
      .delete(artifactChunk)
      .where(eq(artifactChunk.artifactId, artifactId))
    return
  }

  const newChunks = chunkMarkdown(title, content)

  const existing = await db
    .select({
      id: artifactChunk.id,
      heading: artifactChunk.heading,
      hash: artifactChunk.hash,
      embedding: artifactChunk.embedding,
    })
    .from(artifactChunk)
    .where(eq(artifactChunk.artifactId, artifactId))

  const existingByHeading = new Map(existing.map((c) => [c.heading, c]))
  const newHeadings = new Set(newChunks.map((c) => c.heading))

  const toEmbed = newChunks.filter((c) => {
    const old = existingByHeading.get(c.heading)
    return !old || old.hash !== c.hash || !old.embedding
  })

  const freshEmbeddings = new Map<string | null, number[]>()
  if (toEmbed.length > 0) {
    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: toEmbed.map((c) => c.content),
    })
    toEmbed.forEach((chunk, i) => freshEmbeddings.set(chunk.heading, embeddings[i]))
  }

  await db.transaction(async (tx) => {
    const removedIds = existing
      .filter((c) => !newHeadings.has(c.heading))
      .map((c) => c.id)
    if (removedIds.length > 0) {
      await tx.delete(artifactChunk).where(inArray(artifactChunk.id, removedIds))
    }

    const rows = newChunks.map((chunk) => ({
      artifactId,
      chunkIndex: chunk.chunkIndex,
      heading: chunk.heading,
      content: chunk.content,
      hash: chunk.hash,
      embedding:
        freshEmbeddings.get(chunk.heading) ??
        existingByHeading.get(chunk.heading)?.embedding ??
        null,
    }))

    const namedRows = rows.filter((r) => r.heading !== null)
    if (namedRows.length > 0) {
      await tx
        .insert(artifactChunk)
        .values(namedRows)
        .onConflictDoUpdate({
          target: [artifactChunk.artifactId, artifactChunk.heading],
          targetWhere: sql`${artifactChunk.heading} IS NOT NULL`,
          set: {
            chunkIndex: sql`excluded.chunk_index`,
            content: sql`excluded.content`,
            hash: sql`excluded.hash`,
            embedding: sql`excluded.embedding`,
          },
        })
    }

    const introRow = rows.find((r) => r.heading === null)
    if (introRow) {
      const existingIntro = existing.find((c) => c.heading === null)
      if (existingIntro) {
        await tx
          .update(artifactChunk)
          .set({
            chunkIndex: introRow.chunkIndex,
            content: introRow.content,
            hash: introRow.hash,
            embedding: introRow.embedding,
          })
          .where(
            and(
              eq(artifactChunk.artifactId, artifactId),
              isNull(artifactChunk.heading)
            )
          )
      } else {
        await tx.insert(artifactChunk).values(introRow)
      }
    }
  })
}
