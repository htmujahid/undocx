import { sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { aiUsage } from "@/lib/db/schema"

function utcDay(date = new Date()) {
  return date.toISOString().slice(0, 10) // YYYY-MM-DD
}

/**
 * Atomically records one AI generation for the user against today's quota.
 *
 * The increment only happens while the user is still under `limit`, so the
 * stored count can never exceed it and the check is safe against concurrent
 * requests: when the cap is already reached the conflict update matches no
 * row and `RETURNING` comes back empty.
 */
export async function consumeAiGeneration(userId: string, limit: number) {
  const day = utcDay()

  const [row] = await db
    .insert(aiUsage)
    .values({ userId, day, count: 1 })
    .onConflictDoUpdate({
      target: [aiUsage.userId, aiUsage.day],
      set: { count: sql`${aiUsage.count} + 1` },
      setWhere: sql`${aiUsage.count} < ${limit}`,
    })
    .returning({ count: aiUsage.count })

  if (!row) {
    return { allowed: false, remaining: 0, limit }
  }

  return { allowed: true, remaining: Math.max(0, limit - row.count), limit }
}
