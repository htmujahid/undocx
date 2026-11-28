"use server";

import { refresh as refreshRouter, revalidatePath } from "next/cache";
import { requireUserId } from "~@/lib/auth/session";
import { listChatThreads as listChatThreadsFor, removeChatThread } from "~@/lib/db/repository/chat";
import { newId } from "~@/lib/id";

export async function listChatThreads() {
  return listChatThreadsFor(await requireUserId());
}

export async function startChat() {
  await requireUserId();
  return { id: newId() };
}

export async function deleteChatThread(id: string) {
  await removeChatThread(await requireUserId(), id);
  revalidatePath("/chat", "layout");
  refreshRouter();
}
