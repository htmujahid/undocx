"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "~@/lib/auth/session";
import type { FormState } from "~@/lib/context/limits";
import { countDocuments, insertDocument, listDocuments as listDocumentsFor, removeDocument, renameDocument, updateDocumentStatus } from "~@/lib/db/repository/document";
import { documentLimits } from "~@/lib/documents/limits";
import { statusSchema, titleSchema, type DocumentStatus, type TitleValues } from "~@/lib/documents/schemas";

function refresh() {
  revalidatePath("/documents", "layout");
}

export async function listDocuments() {
  return listDocumentsFor(await requireUserId());
}

export async function createDocument() {
  const userId = await requireUserId();
  if ((await countDocuments(userId)) >= documentLimits.perUser) return null;
  const id = await insertDocument(userId);
  refresh();
  return id;
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
