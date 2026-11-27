"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type { DocumentStatus, TitleValues } from "~@/lib/documents/schemas";
import { createDocument, deleteDocument, listDocuments, setDocumentStatus, updateTitle } from "./actions";

export const documentsKey = "documents";

export type DocumentSummary = Awaited<ReturnType<typeof listDocuments>>[number];

export function useDocuments(initial: DocumentSummary[]) {
  return useSWR(documentsKey, () => listDocuments(), { fallbackData: initial }).data;
}

export function useCreateDocument() {
  return useSWRMutation(documentsKey, () => createDocument());
}

export function useUpdateTitle(id: string) {
  return useSWRMutation(documentsKey, (_key, { arg }: { arg: TitleValues }) => updateTitle(id, arg));
}

export function useSetDocumentStatus(id: string) {
  return useSWRMutation(documentsKey, (_key, { arg }: { arg: DocumentStatus }) => setDocumentStatus(id, arg));
}

export function useDeleteDocument(id: string) {
  return useSWRMutation(documentsKey, () => deleteDocument(id));
}
