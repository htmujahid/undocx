import "server-only";

import type { UIMessage } from "ai";
import { and, asc, desc, eq, notInArray, sql } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "~@/lib/db";
import { chatMessage, chatThread } from "~@/lib/db/schema";
import { chatLimits } from "~@/lib/chat/schemas";

export async function listChatThreads(userId: string) {
  await connection();
  return db
    .select({ id: chatThread.id, title: chatThread.title, updatedAt: chatThread.updatedAt })
    .from(chatThread)
    .where(eq(chatThread.userId, userId))
    .orderBy(desc(chatThread.updatedAt), desc(chatThread.id))
    .limit(chatLimits.listed);
}

export async function findChatThread(userId: string, id: string) {
  await connection();
  const [row] = await db
    .select({ id: chatThread.id, title: chatThread.title })
    .from(chatThread)
    .where(and(eq(chatThread.id, id), eq(chatThread.userId, userId)));
  return row ?? null;
}

export async function ensureChatThread(userId: string, id: string, title: string) {
  await db.insert(chatThread).values({ id, userId, title }).onConflictDoNothing();
  const thread = await findChatThread(userId, id);
  if (!thread) return null;
  const keep = db.select({ id: chatThread.id }).from(chatThread).where(eq(chatThread.userId, userId)).orderBy(desc(chatThread.updatedAt)).limit(chatLimits.kept);
  await db.delete(chatThread).where(and(eq(chatThread.userId, userId), notInArray(chatThread.id, keep)));
  return thread;
}

export async function listChatMessages(threadId: string): Promise<UIMessage[]> {
  await connection();
  const rows = await db.select().from(chatMessage).where(eq(chatMessage.threadId, threadId)).orderBy(asc(chatMessage.position));
  return rows.map((row) => ({
    id: row.id,
    role: row.role as UIMessage["role"],
    parts: row.parts as UIMessage["parts"],
    ...(row.metadata ? { metadata: row.metadata } : {}),
  }));
}

export async function saveChatMessages(threadId: string, messages: UIMessage[]) {
  if (messages.length === 0) return;
  await db.transaction(async (tx) => {
    await tx
      .insert(chatMessage)
      .values(messages.map((message, position) => ({ id: message.id, threadId, position, role: message.role, parts: message.parts, metadata: message.metadata ?? null })))
      .onConflictDoUpdate({
        target: chatMessage.id,
        set: { position: sql`excluded.position`, parts: sql`excluded.parts`, metadata: sql`excluded.metadata` },
        setWhere: eq(chatMessage.threadId, threadId),
      });
    await tx.update(chatThread).set({ updatedAt: new Date() }).where(eq(chatThread.id, threadId));
  });
}

export async function removeChatThread(userId: string, id: string) {
  await db.delete(chatThread).where(and(eq(chatThread.id, id), eq(chatThread.userId, userId)));
}
