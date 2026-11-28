"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { deleteChatThread, listChatThreads, searchStatus, startChat, updateSearch } from "./actions";

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

export const searchStatusKey = "chat/search-status";

export function useSearchStatus() {
  return useSWR(searchStatusKey, () => searchStatus());
}

export function useUpdateSearch() {
  return useSWRMutation("chat/search-update", () => updateSearch());
}
