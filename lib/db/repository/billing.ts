import "server-only";

import { and, desc, eq, gte, sql } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "~@/lib/db";
import { aiRun, subscription } from "~@/lib/db/schema";
import { isEntitled, monthWindow, plans, type PlanId } from "~@/lib/billing/plans";

export async function upsertSubscription(row: typeof subscription.$inferInsert) {
  await db
    .insert(subscription)
    .values(row)
    .onConflictDoUpdate({
      target: subscription.id,
      set: {
        productId: row.productId,
        status: row.status,
        currentPeriodStart: row.currentPeriodStart,
        currentPeriodEnd: row.currentPeriodEnd,
        cancelAtPeriodEnd: row.cancelAtPeriodEnd,
        canceledAt: row.canceledAt ?? null,
        endsAt: row.endsAt ?? null,
        endedAt: row.endedAt ?? null,
        modifiedAt: row.modifiedAt,
      },
      setWhere: sql`${subscription.modifiedAt} <= ${row.modifiedAt}`,
    });
}

export async function hasActiveSubscription(userId: string) {
  const rows = await db.select({ status: subscription.status }).from(subscription).where(eq(subscription.userId, userId));
  return rows.some((row) => isEntitled(row.status));
}

export async function getEntitlement(userId: string) {
  await connection();
  const rows = await db.select().from(subscription).where(eq(subscription.userId, userId)).orderBy(desc(subscription.currentPeriodEnd));
  const active = rows.find((row) => isEntitled(row.status)) ?? null;
  const now = new Date();
  const plan: PlanId = active ? "pro" : "free";
  const window = active && active.currentPeriodEnd > now ? { start: active.currentPeriodStart, end: active.currentPeriodEnd } : monthWindow(now);
  return { plan, limits: plans[plan].limits, subscription: active, window };
}

export async function usageSince(userId: string, since: Date) {
  const [row] = await db
    .select({
      micros: sql<number>`coalesce(sum(${aiRun.costMicros}), 0)`.mapWith(Number),
      runs: sql<number>`count(*)`.mapWith(Number),
    })
    .from(aiRun)
    .where(and(eq(aiRun.userId, userId), gte(aiRun.createdAt, since)));
  return row;
}
