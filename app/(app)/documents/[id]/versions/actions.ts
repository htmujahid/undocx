"use server";

import { requireUserId } from "~@/lib/auth/session";
import type { FormState } from "~@/lib/context/limits";
import { countVersions, findVersion, insertVersion, listVersions as listVersionsFor, removeVersion, renameVersion as renameVersionFor, replaceDocumentContent } from "~@/lib/db/repository/version";
import { summarizeContent } from "~@/lib/documents/content";
import { versionLimits } from "~@/lib/documents/limits";
import { versionContentSchema, versionNameSchema, type VersionNameValues } from "~@/lib/documents/schemas";

export type SaveVersionInput = { content: string; name?: string | null; kind: "manual" | "ai"; label?: string | null; baseline?: string | null };
export type SaveVersionResult = { number: number } | { error: string };

const full = `This document has ${versionLimits.perDocument} versions. Delete one to make room.`;

export async function listVersions(documentId: string) {
  return listVersionsFor(await requireUserId(), documentId);
}

export async function saveVersion(documentId: string, input: SaveVersionInput): Promise<SaveVersionResult> {
  const userId = await requireUserId();
  const content = versionContentSchema.safeParse(input.content);
  if (!content.success) return { error: content.error.issues[0].message };
  const name = versionNameSchema.safeParse({ name: input.name ?? "" });
  if (!name.success) return { error: name.error.issues[0].message };

  if (input.kind === "ai" && input.baseline && (await countVersions(documentId)) === 0) {
    const baseline = versionContentSchema.safeParse(input.baseline);
    if (baseline.success) await insertVersion(userId, documentId, { kind: "restore", label: "Before AI changes", content: baseline.data, wordCount: summarizeContent(baseline.data).wordCount });
  }

  const created = await insertVersion(userId, documentId, {
    kind: input.kind,
    name: name.data.name || null,
    label: input.kind === "ai" ? (input.label?.slice(0, 200) ?? null) : null,
    content: content.data,
    wordCount: summarizeContent(content.data).wordCount,
  });
  return created ? { number: created.number } : { error: full };
}

export async function renameVersion(documentId: string, id: string, values: VersionNameValues): Promise<FormState> {
  const parsed = versionNameSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!(await renameVersionFor(await requireUserId(), documentId, id, parsed.data.name || null))) return { error: "This version no longer exists." };
  return { saved: true };
}

export async function deleteVersion(documentId: string, id: string) {
  await removeVersion(await requireUserId(), documentId, id);
}

export type RestoreResult = { content: string; version: number } | { error: string };

export async function restoreVersion(documentId: string, id: string, current: string): Promise<RestoreResult> {
  const userId = await requireUserId();
  const target = await findVersion(userId, documentId, id);
  if (!target) return { error: "This version no longer exists." };
  const backup = versionContentSchema.safeParse(current);
  if (!backup.success) return { error: backup.error.issues[0].message };
  const saved = await insertVersion(userId, documentId, { kind: "restore", label: `Before restoring v${target.number}`, content: backup.data, wordCount: summarizeContent(backup.data).wordCount });
  if (!saved) return { error: full };
  const version = await replaceDocumentContent(userId, documentId, { content: target.content, ...summarizeContent(target.content) });
  if (version === null) return { error: "This document no longer exists." };
  return { content: JSON.stringify(target.content), version };
}
