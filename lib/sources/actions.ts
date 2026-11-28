"use server";

import { revalidatePath } from "next/cache";
import { limitMessage } from "~@/lib/billing/plans";
import { getEntitlement } from "~@/lib/db/repository/billing";
import { requireUserId } from "~@/lib/auth/session";
import type { FormState } from "~@/lib/context/limits";
import { countWords } from "~@/lib/context/limits";
import { findDocument } from "~@/lib/db/repository/document";
import { attachSources, countDocumentSources, countSources, detachSource as detachSourceFor, insertSource, searchSources as searchSourcesFor, removeSource, renameSource as renameSourceFor } from "~@/lib/db/repository/source";
import { deleteObject } from "~@/lib/storage/s3";
import { sourceLimits } from "./limits";
import { linkSourceSchema, renameSourceSchema, sourceSearchSchema, textSourceSchema, type SourceSearchInput, type LinkSourceValues, type RenameSourceValues, type TextSourceValues } from "./schemas";

export type CreatedSource = { id: string; kind: "file" | "text" | "link"; title: string; url: string | null };
export type CreateResult = { source: CreatedSource } | { error: string };

function refresh() {
  revalidatePath("/library", "layout");
  revalidatePath("/documents", "layout");
}

async function checkRoom(userId: string, documentId: string | undefined, isNew: boolean) {
  const { plan, limits } = await getEntitlement(userId);
  if (isNew && (await countSources(userId)) >= limits.sources) return limitMessage(plan, "sources in your library", "sources");
  if (documentId) {
    if (!(await findDocument(userId, documentId))) return "This document no longer exists.";
    if ((await countDocumentSources(documentId)) >= limits.sourcesPerDocument) return limitMessage(plan, "sources per document", "sourcesPerDocument");
  }
  return null;
}

export async function searchSources(input: SourceSearchInput) {
  const parsed = sourceSearchSchema.safeParse(input);
  const { query, offset, excludeDocumentId } = parsed.success ? parsed.data : { query: "", offset: 0, excludeDocumentId: undefined };
  return searchSourcesFor(await requireUserId(), { query, offset, limit: sourceLimits.pageSize, excludeDocumentId });
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
