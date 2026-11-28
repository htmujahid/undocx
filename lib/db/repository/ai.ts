import "server-only";

import type { UIMessage } from "ai";
import { and, asc, count, eq, sql } from "drizzle-orm";
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
    await tx
      .insert(aiMessage)
      .values(messages.map((message, position) => ({ id: message.id, threadId, position, role: message.role, parts: message.parts, metadata: message.metadata ?? null })))
      .onConflictDoUpdate({
        target: aiMessage.id,
        set: { position: sql`excluded.position`, parts: sql`excluded.parts`, metadata: sql`excluded.metadata` },
        setWhere: eq(aiMessage.threadId, threadId),
      });
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

const staleRunMs = 5 * 60 * 1000;

export async function startRun(run: typeof aiRun.$inferInsert) {
  const [row] = await db.insert(aiRun).values({ ...run, status: "running" }).returning({ id: aiRun.id });
  return row.id;
}

export async function finishRun(id: string, fields: Partial<typeof aiRun.$inferInsert>) {
  await db.update(aiRun).set(fields).where(eq(aiRun.id, id));
}

export async function discardRun(id: string) {
  await db.delete(aiRun).where(eq(aiRun.id, id));
}

export async function countRunning(userId: string) {
  const since = new Date(Date.now() - staleRunMs).toISOString();
  const [row] = await db
    .select({ total: count() })
    .from(aiRun)
    .where(and(eq(aiRun.userId, userId), eq(aiRun.status, "running"), sql`${aiRun.createdAt} >= ${since}::timestamp`));
  return row.total;
}
