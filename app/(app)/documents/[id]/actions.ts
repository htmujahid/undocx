"use server";

import { requireUserId } from "~@/lib/auth/session";
import { clearThread } from "~@/lib/db/repository/ai";
import { findDocument, saveDocumentContent } from "~@/lib/db/repository/document";
import { removeNotes, upsertNote } from "~@/lib/db/repository/note";
import { summarizeContent } from "~@/lib/documents/content";
import { noteSchema, saveSchema, type NoteValues } from "~@/lib/documents/schemas";

export type SaveResult = { version: number } | { error: string; isConflict?: boolean };

export async function saveDocument(id: string, input: { content: string; version: number }): Promise<SaveResult> {
  const userId = await requireUserId();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const version = await saveDocumentContent(userId, id, parsed.data.version, { content: parsed.data.content, ...summarizeContent(parsed.data.content) });
  if (version === null) return { error: "This document changed somewhere else. Reload to continue.", isConflict: true };
  return { version };
}

export async function clearAssistant(id: string) {
  await clearThread(await requireUserId(), id);
}

export async function saveNote(documentId: string, values: NoteValues) {
  const parsed = noteSchema.safeParse(values);
  if (!parsed.success || !(await findDocument(await requireUserId(), documentId))) return;
  await upsertNote(documentId, parsed.data);
}

export async function deleteNote(documentId: string, markId: string) {
  if (!(await findDocument(await requireUserId(), documentId))) return;
  await removeNotes(documentId, [markId]);
}
