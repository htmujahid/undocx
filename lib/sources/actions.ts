"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "~@/lib/auth/session";
import type { FormState } from "~@/lib/context/limits";
import { countWords } from "~@/lib/context/limits";
import { findDocument } from "~@/lib/db/repository/document";
import { attachSources, countDocumentSources, countSources, detachSource as detachSourceFor, insertSource, listSources as listSourcesFor, removeSource, renameSource as renameSourceFor } from "~@/lib/db/repository/source";
import { deleteObject } from "~@/lib/storage/s3";
import { sourceLimits } from "./limits";
import { linkSourceSchema, renameSourceSchema, textSourceSchema, type LinkSourceValues, type RenameSourceValues, type TextSourceValues } from "./schemas";

export type CreatedSource = { id: string; kind: "file" | "text" | "link"; title: string; url: string | null };
export type CreateResult = { source: CreatedSource } | { error: string };

function refresh() {
  revalidatePath("/library", "layout");
  revalidatePath("/documents", "layout");
}

async function checkRoom(userId: string, documentId: string | undefined, isNew: boolean) {
  if (isNew && (await countSources(userId)) >= sourceLimits.perUser) return `You can keep up to ${sourceLimits.perUser} sources.`;
  if (documentId) {
    if (!(await findDocument(userId, documentId))) return "This document no longer exists.";
    if ((await countDocumentSources(documentId)) >= sourceLimits.perDocument) return `A document can use up to ${sourceLimits.perDocument} sources.`;
  }
  return null;
}

export async function listSources() {
  return listSourcesFor(await requireUserId());
}

export async function createTextSource(values: TextSourceValues, documentId?: string): Promise<CreateResult> {
  const userId = await requireUserId();
  const parsed = textSourceSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const problem = await checkRoom(userId, documentId, true);
  if (problem) return { error: problem };
  const created = await insertSource(userId, { kind: "text", title: parsed.data.title, content: parsed.data.content, wordCount: countWords(parsed.data.content) });
  if (documentId) await attachSources(userId, documentId, [created.id]);
  refresh();
  return { source: created };
}

export async function createLinkSource(values: LinkSourceValues, documentId?: string): Promise<CreateResult> {
  const userId = await requireUserId();
  const parsed = linkSourceSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const problem = await checkRoom(userId, documentId, true);
  if (problem) return { error: problem };
  const created = await insertSource(userId, { kind: "link", title: parsed.data.title, url: parsed.data.url });
  if (documentId) await attachSources(userId, documentId, [created.id]);
  refresh();
  return { source: created };
}

export async function renameSource(id: string, values: RenameSourceValues): Promise<FormState> {
  const userId = await requireUserId();
  const parsed = renameSourceSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!(await renameSourceFor(userId, id, parsed.data.title))) return { error: "This source no longer exists." };
  refresh();
  return { saved: true };
}

export async function deleteSource(id: string) {
  const removed = await removeSource(await requireUserId(), id);
  if (removed?.assetKey) await deleteObject(removed.assetKey).catch(() => undefined);
  refresh();
}

export async function attachSource(documentId: string, sourceId: string): Promise<FormState> {
  const userId = await requireUserId();
  const problem = await checkRoom(userId, documentId, false);
  if (problem) return { error: problem };
  await attachSources(userId, documentId, [sourceId]);
  return { saved: true };
}

export async function detachSource(documentId: string, sourceId: string) {
  const userId = await requireUserId();
  if (!(await findDocument(userId, documentId))) return;
  await detachSourceFor(documentId, sourceId);
}
