"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type { VersionNameValues } from "~@/lib/documents/schemas";
import { deleteVersion, listVersions, renameVersion, restoreVersion, saveVersion, type SaveVersionInput } from "./actions";

export const versionsKey = (documentId: string) => `versions/${documentId}`;

export type VersionSummary = Awaited<ReturnType<typeof listVersions>>[number];

export function useVersions(documentId: string) {
  return useSWR(versionsKey(documentId), () => listVersions(documentId));
}

export function useSaveVersion(documentId: string) {
  return useSWRMutation(versionsKey(documentId), (_key, { arg }: { arg: SaveVersionInput }) => saveVersion(documentId, arg));
}

export function useRenameVersion(documentId: string) {
  return useSWRMutation(versionsKey(documentId), (_key, { arg }: { arg: { id: string; values: VersionNameValues } }) => renameVersion(documentId, arg.id, arg.values));
}

export function useDeleteVersion(documentId: string) {
  return useSWRMutation(versionsKey(documentId), (_key, { arg }: { arg: string }) => deleteVersion(documentId, arg));
}

export function useRestoreVersion(documentId: string) {
  return useSWRMutation(versionsKey(documentId), (_key, { arg }: { arg: { id: string; current: string } }) => restoreVersion(documentId, arg.id, arg.current));
}
