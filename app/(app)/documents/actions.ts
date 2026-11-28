"use server";

import { refresh as refreshRouter, revalidatePath } from "next/cache";
import { limitMessage } from "~@/lib/billing/plans";
import { getEntitlement } from "~@/lib/db/repository/billing";
import { requireUserId } from "~@/lib/auth/session";
import type { FormState } from "~@/lib/context/limits";
import { countDocuments, insertDocument, removeDocument, renameDocument, updateDocumentStatus } from "~@/lib/db/repository/document";
import { countFolders, countTags, insertFolder, listDocumentTagNames, moveDocument as moveDocumentTo, removeFolder, renameFolder as renameFolderTo, setDocumentTags } from "~@/lib/db/repository/organization";
import { organizeLimits } from "~@/lib/documents/limits";
import { folderSchema, statusSchema, tagNameSchema, titleSchema, type DocumentStatus, type FolderValues, type TitleValues } from "~@/lib/documents/schemas";

function refresh() {
  revalidatePath("/documents", "layout");
  refreshRouter();
}

export async function createDocument(): Promise<{ id: string } | { error: string }> {
  const userId = await requireUserId();
  const { plan, limits } = await getEntitlement(userId);
  if ((await countDocuments(userId)) >= limits.documents) return { error: limitMessage(plan, "documents", "documents") };
  const id = await insertDocument(userId);
  refresh();
  return { id };
}

export async function updateTitle(id: string, values: TitleValues): Promise<FormState> {
  const userId = await requireUserId();
  const parsed = titleSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!(await renameDocument(userId, id, parsed.data.title))) return { error: "This document no longer exists." };
  refresh();
  return { saved: true };
}

export async function setDocumentStatus(id: string, status: DocumentStatus) {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return;
  await updateDocumentStatus(await requireUserId(), id, parsed.data);
  refresh();
}

export async function deleteDocument(id: string) {
  await removeDocument(await requireUserId(), id);
  refresh();
}

export async function createFolder(values: FolderValues): Promise<FormState> {
  const userId = await requireUserId();
  const parsed = folderSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if ((await countFolders(userId)) >= organizeLimits.folders) return { error: `You can have up to ${organizeLimits.folders} folders.` };
  if (!(await insertFolder(userId, parsed.data.name))) return { error: "You already have a folder with that name." };
  refresh();
  return { saved: true };
}

export async function renameFolder(id: string, values: FolderValues): Promise<FormState> {
  const parsed = folderSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const result = await renameFolderTo(await requireUserId(), id, parsed.data.name);
  if (result === "duplicate") return { error: "You already have a folder with that name." };
  if (result === "missing") return { error: "This folder no longer exists." };
  refresh();
  return { saved: true };
}

export async function deleteFolder(id: string) {
  await removeFolder(await requireUserId(), id);
  refresh();
}

export async function moveDocument(id: string, folderId: string | null): Promise<FormState> {
  if (!(await moveDocumentTo(await requireUserId(), id, folderId))) return { error: "This document or folder no longer exists." };
  refresh();
  return { saved: true };
}

export async function setTags(id: string, names: string[]): Promise<FormState> {
  const userId = await requireUserId();
  const unique = new Map<string, string>();
  for (const name of names) {
    const parsed = tagNameSchema.safeParse(name);
    if (!parsed.success) return { error: `Tags can be up to ${organizeLimits.tagName} characters.` };
    unique.set(parsed.data.toLowerCase(), parsed.data);
  }
  const tags = [...unique.values()];
  if (tags.length > organizeLimits.tagsPerDocument) return { error: `A document can have up to ${organizeLimits.tagsPerDocument} tags.` };
  const known = new Set((await listDocumentTagNames(userId, tags)).map((row) => row.name.toLowerCase()));
  const fresh = tags.filter((name) => !known.has(name.toLowerCase())).length;
  if (fresh > 0 && (await countTags(userId)) + fresh > organizeLimits.tags) return { error: `You can have up to ${organizeLimits.tags} different tags.` };
  if (!(await setDocumentTags(userId, id, tags))) return { error: "This document no longer exists." };
  refresh();
  return { saved: true };
}
