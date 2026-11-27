"use client";

import useSWRMutation from "swr/mutation";
import { postJson } from "~@/lib/ai/client";
import type { ClaimsRequest, RewriteRequest, VariationsRequest } from "~@/lib/ai/schemas";
import type { NoteValues } from "~@/lib/documents/schemas";
import { clearAssistant, deleteNote, saveDocument, saveNote } from "./actions";

export function useSaveDocument(id: string) {
  return useSWRMutation("documents", (_key, { arg }: { arg: { content: string; version: number } }) => saveDocument(id, arg));
}

export function useClearAssistant(id: string) {
  return useSWRMutation(`assistant/${id}`, () => clearAssistant(id));
}

export function useSaveNote(id: string) {
  return useSWRMutation(`notes/${id}`, (_key, { arg }: { arg: NoteValues }) => saveNote(id, arg));
}

export function useDeleteNote(id: string) {
  return useSWRMutation(`notes/${id}`, (_key, { arg }: { arg: string }) => deleteNote(id, arg));
}

export function useRewrite(id: string) {
  return useSWRMutation(`rewrite/${id}`, (_key, { arg }: { arg: RewriteRequest }) => postJson<{ items: { index: number; text: string }[] }>(`/documents/${id}/rewrite`, arg));
}

export function useVariations(id: string) {
  return useSWRMutation(`variations/${id}`, (_key, { arg }: { arg: VariationsRequest }) => postJson<{ variations: string[] }>(`/documents/${id}/variations`, arg));
}

export type ClaimResult = { blockIndex: number; text: string; kind: "number" | "date" | "quote" | "statement"; status: "cited" | "uncited" | "unsourced" | "unsupported" | "contradicted"; sourceId: string | null; note: string };

export function useClaims(id: string) {
  return useSWRMutation(`claims/${id}`, (_key, { arg }: { arg: ClaimsRequest }) => postJson<{ claims: ClaimResult[] }>(`/documents/${id}/claims`, arg));
}
