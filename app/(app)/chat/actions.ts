"use server";

import { requireUserId } from "~@/lib/auth/session";
import { clearChat } from "~@/lib/db/repository/chat";

export async function clearConversation() {
  await clearChat(await requireUserId());
}
