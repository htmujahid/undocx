"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { attachSource, createLinkSource, createTextSource, deleteSource, detachSource, listSources, renameSource, type CreatedSource } from "./actions";
import type { LinkSourceValues, RenameSourceValues, TextSourceValues } from "./schemas";

export const sourcesKey = "sources";

export type SourceSummary = Awaited<ReturnType<typeof listSources>>[number];

export function useSources(initial?: SourceSummary[]) {
  return useSWR(sourcesKey, () => listSources(), { fallbackData: initial });
}

export function useCreateTextSource(documentId?: string) {
  return useSWRMutation(sourcesKey, (_key, { arg }: { arg: TextSourceValues }) => createTextSource(arg, documentId));
}

export function useCreateLinkSource(documentId?: string) {
  return useSWRMutation(sourcesKey, (_key, { arg }: { arg: LinkSourceValues }) => createLinkSource(arg, documentId));
}

export function useUploadSource(documentId?: string) {
  return useSWRMutation(sourcesKey, async (_key, { arg }: { arg: { file: File; title: string } }): Promise<{ source: CreatedSource }> => {
    const form = new FormData();
    form.set("file", arg.file);
    if (arg.title.trim()) form.set("title", arg.title.trim());
    if (documentId) form.set("documentId", documentId);
    const response = await fetch("/library/sources/upload", { method: "POST", body: form });
    const body = (await response.json().catch(() => null)) as { source?: CreatedSource; error?: string } | null;
    if (!response.ok || !body?.source) throw new Error(body?.error ?? "The file could not be uploaded. Try again.");
    return { source: body.source };
  });
}

export function useRenameSource(id: string) {
  return useSWRMutation(sourcesKey, (_key, { arg }: { arg: RenameSourceValues }) => renameSource(id, arg));
}

export function useDeleteSource(id: string) {
  return useSWRMutation(sourcesKey, () => deleteSource(id));
}

export function useAttachSource(documentId: string) {
  return useSWRMutation(sourcesKey, (_key, { arg }: { arg: string }) => attachSource(documentId, arg));
}

export function useDetachSource(documentId: string) {
  return useSWRMutation(sourcesKey, (_key, { arg }: { arg: string }) => detachSource(documentId, arg));
}
