"use client";

import { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import useSWRMutation from "swr/mutation";
import { useDebouncedValue } from "~@/hooks/use-debounced-value";
import { attachSource, createLinkSource, createTextSource, deleteSource, detachSource, renameSource, searchSources, type CreatedSource } from "./actions";
import { sourceLimits } from "./limits";
import type { LinkSourceValues, RenameSourceValues, TextSourceValues } from "./schemas";

export const sourcesKey = "sources";

export type SourcePage = Awaited<ReturnType<typeof searchSources>>;
export type SourceSummary = SourcePage["items"][number];

export function useSourceSearch({ query, excludeDocumentId, initial }: { query: string; excludeDocumentId?: string; initial?: SourcePage }) {
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, sourceLimits.searchDelay);
  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
    (index: number, previous: SourcePage | null) => (previous && !previous.hasMore ? null : ([sourcesKey, debounced, excludeDocumentId ?? "", index] as const)),
    ([, text, exclude, index]) => searchSources({ query: text, excludeDocumentId: exclude || undefined, offset: index * sourceLimits.pageSize }),
    { keepPreviousData: true, fallbackData: !debounced && !excludeDocumentId && initial ? [initial] : undefined },
  );
  const pages = data ?? [];
  return {
    items: pages.flatMap((page) => page.items),
    hasMore: pages[pages.length - 1]?.hasMore ?? false,
    isLoading,
    isWaiting: trimmed !== debounced,
    isFetching: isValidating,
    isLoadingMore: size > pages.length,
    loadMore: () => void setSize(size + 1),
  };
}

function useSourceMutation<Arg, Result>(fetcher: (arg: Arg) => Promise<Result>) {
  const { mutate } = useSWRConfig();
  return useSWRMutation(sourcesKey, (_key, { arg }: { arg: Arg }) => fetcher(arg), {
    revalidate: false,
    onSuccess: () => mutate((key) => (Array.isArray(key) && key[0] === sourcesKey) || (typeof key === "string" && key.startsWith("$inf$") && key.includes(sourcesKey))),
  });
}

export function useCreateTextSource(documentId?: string) {
  return useSourceMutation((values: TextSourceValues) => createTextSource(values, documentId));
}

export function useCreateLinkSource(documentId?: string) {
  return useSourceMutation((values: LinkSourceValues) => createLinkSource(values, documentId));
}

export function useUploadSource(documentId?: string) {
  return useSourceMutation(async ({ file, title }: { file: File; title: string }): Promise<{ source: CreatedSource }> => {
    const form = new FormData();
    form.set("file", file);
    if (title.trim()) form.set("title", title.trim());
    if (documentId) form.set("documentId", documentId);
    const response = await fetch("/library/sources/upload", { method: "POST", body: form });
    const body = (await response.json().catch(() => null)) as { source?: CreatedSource; error?: string } | null;
    if (!response.ok || !body?.source) throw new Error(body?.error ?? "The file could not be uploaded. Try again.");
    return { source: body.source };
  });
}

export function useRenameSource(id: string) {
  return useSourceMutation((values: RenameSourceValues) => renameSource(id, values));
}

export function useDeleteSource(id: string) {
  return useSourceMutation(() => deleteSource(id));
}

export function useAttachSource(documentId: string) {
  return useSourceMutation((sourceId: string) => attachSource(documentId, sourceId));
}

export function useDetachSource(documentId: string) {
  return useSourceMutation((sourceId: string) => detachSource(documentId, sourceId));
}
