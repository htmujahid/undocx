"use client";

import useSWRMutation from "swr/mutation";
import type { DocumentStatus, FolderValues, TitleValues } from "~@/lib/documents/schemas";
import { createDocument, createFolder, deleteDocument, deleteFolder, moveDocument, renameFolder, setDocumentStatus, setTags, updateTitle } from "./actions";

export const documentsKey = "documents";

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

export function useCreateFolder() {
  return useSWRMutation(documentsKey, (_key, { arg }: { arg: FolderValues }) => createFolder(arg));
}

export function useRenameFolder(id: string) {
  return useSWRMutation(documentsKey, (_key, { arg }: { arg: FolderValues }) => renameFolder(id, arg));
}

export function useDeleteFolder(id: string) {
  return useSWRMutation(documentsKey, () => deleteFolder(id));
}

export function useMoveDocument(id: string) {
  return useSWRMutation(documentsKey, (_key, { arg }: { arg: string | null }) => moveDocument(id, arg));
}

export function useSetTags(id: string) {
  return useSWRMutation(documentsKey, (_key, { arg }: { arg: string[] }) => setTags(id, arg));
}
