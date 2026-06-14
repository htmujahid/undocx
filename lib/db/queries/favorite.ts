import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { artifactFavorite } from "@/lib/db/schema"

export async function listFavoriteArtifactIds(userId: string) {
  const rows = await db
    .select({ artifactId: artifactFavorite.artifactId })
    .from(artifactFavorite)
    .where(eq(artifactFavorite.userId, userId))
  return rows.map((r) => r.artifactId)
}

export async function getFavorite(userId: string, artifactId: string) {
  const [existing] = await db
    .select()
    .from(artifactFavorite)
    .where(
      and(
        eq(artifactFavorite.userId, userId),
        eq(artifactFavorite.artifactId, artifactId)
      )
    )
  return existing ?? null
}

export async function addFavorite(userId: string, artifactId: string) {
  await db.insert(artifactFavorite).values({ userId, artifactId })
}

export async function removeFavorite(userId: string, artifactId: string) {
  await db
    .delete(artifactFavorite)
    .where(
      and(
        eq(artifactFavorite.userId, userId),
        eq(artifactFavorite.artifactId, artifactId)
      )
    )
}
