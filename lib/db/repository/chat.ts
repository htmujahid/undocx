import "server-only";

import type { UIMessage } from "ai";
import { asc, eq, sql } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "~@/lib/db";
import { chatMessage } from "~@/lib/db/schema";

export async function listChatMessages(userId: string): Promise<UIMessage[]> {
  await connection();
  const rows = await db.select().from(chatMessage).where(eq(chatMessage.userId, userId)).orderBy(asc(chatMessage.position));
  return rows.map((row) => ({
    id: row.id,
    role: row.role as UIMessage["role"],
    parts: row.parts as UIMessage["parts"],
    ...(row.metadata ? { metadata: row.metadata } : {}),
  }));
}

export async function saveChatMessages(userId: string, messages: UIMessage[]) {
  if (messages.length === 0) return;
  await db
    .insert(chatMessage)
    .values(messages.map((message, position) => ({ id: message.id, userId, position, role: message.role, parts: message.parts, metadata: message.metadata ?? null })))
    .onConflictDoUpdate({
      target: chatMessage.id,
      set: { position: sql`excluded.position`, parts: sql`excluded.parts`, metadata: sql`excluded.metadata` },
      setWhere: eq(chatMessage.userId, userId),
    });
}

export async function clearChat(userId: string) {
  await db.delete(chatMessage).where(eq(chatMessage.userId, userId));
}
