"use client";

import useSWRMutation from "swr/mutation";
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
