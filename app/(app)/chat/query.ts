"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { deleteChatThread, listChatThreads, startChat } from "./actions";

export const chatThreadsKey = "chat/threads";

export type ChatThreadSummary = Awaited<ReturnType<typeof listChatThreads>>[number];

export function useChatThreads(initial: ChatThreadSummary[]) {
  return useSWR(chatThreadsKey, () => listChatThreads(), { fallbackData: initial, revalidateOnMount: false }).data;
}

export function useStartChat() {
  return useSWRMutation(chatThreadsKey, () => startChat(), { revalidate: false });
}

export function useDeleteChatThread(id: string) {
  return useSWRMutation(chatThreadsKey, () => deleteChatThread(id));
}
