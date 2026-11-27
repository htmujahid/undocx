import "server-only";

import type { UIMessage } from "ai";
import { and, asc, eq, sql } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "~@/lib/db";
import { aiMessage, aiRun, aiThread, document } from "~@/lib/db/schema";

export async function findThread(userId: string, documentId: string) {
  const [row] = await db
    .select()
    .from(aiThread)
    .where(and(eq(aiThread.documentId, documentId), eq(aiThread.userId, userId)));
  return row ?? null;
}

export async function ensureThread(userId: string, documentId: string) {
  const existing = await findThread(userId, documentId);
  if (existing) return existing;
  const [owned] = await db
    .select({ id: document.id })
    .from(document)
    .where(and(eq(document.id, documentId), eq(document.userId, userId)));
  if (!owned) return null;
  await db.insert(aiThread).values({ userId, documentId }).onConflictDoNothing();
  return findThread(userId, documentId);
}

export async function listThreadMessages(userId: string, documentId: string): Promise<UIMessage[]> {
  await connection();
  const thread = await findThread(userId, documentId);
  if (!thread) return [];
  const rows = await db.select().from(aiMessage).where(eq(aiMessage.threadId, thread.id)).orderBy(asc(aiMessage.position));
  return rows.map((row) => ({
    id: row.id,
    role: row.role as UIMessage["role"],
    parts: row.parts as UIMessage["parts"],
    ...(row.metadata ? { metadata: row.metadata } : {}),
  }));
}

export async function saveThreadMessages(threadId: string, messages: UIMessage[]) {
  if (messages.length === 0) return;
  await db.transaction(async (tx) => {
    for (const [position, message] of messages.entries()) {
      await tx
        .insert(aiMessage)
        .values({ id: message.id, threadId, position, role: message.role, parts: message.parts, metadata: message.metadata ?? null })
        .onConflictDoUpdate({
          target: aiMessage.id,
          set: { position, parts: message.parts, metadata: message.metadata ?? null },
          setWhere: eq(aiMessage.threadId, threadId),
        });
    }
    await tx.update(aiThread).set({ updatedAt: new Date() }).where(eq(aiThread.id, threadId));
  });
}

export async function clearThread(userId: string, documentId: string) {
  const thread = await findThread(userId, documentId);
  if (thread) await db.delete(aiMessage).where(eq(aiMessage.threadId, thread.id));
}

export async function insertRun(run: typeof aiRun.$inferInsert) {
  await db.insert(aiRun).values(run);
}

export async function sumUsage(userId: string, since: Date) {
  const [row] = await db
    .select({ runs: sql<number>`count(*)`.mapWith(Number), tokens: sql<number>`coalesce(sum(${aiRun.totalTokens}), 0)`.mapWith(Number) })
    .from(aiRun)
    .where(and(eq(aiRun.userId, userId), sql`${aiRun.createdAt} >= ${since}`));
  return row;
}
