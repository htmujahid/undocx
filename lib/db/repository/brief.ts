import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "~@/lib/db";
import { requestIndexing } from "~@/lib/db/repository/retrieval";
import type { BriefQuestion, OutlineAdvice, OutlineMode } from "~@/lib/documents/brief";
import { document, documentBrief } from "~@/lib/db/schema";

export async function insertDraftingDocument(
  userId: string,
  fields: { title: string; prompt: string; type: string | null; profileId: string | null; voiceId: string | null; ruleSetId: string | null },
) {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(document)
      .values({ userId, title: fields.title, type: fields.type, status: "drafting", profileId: fields.profileId, voiceId: fields.voiceId, ruleSetId: fields.ruleSetId })
      .returning({ id: document.id });
    await tx.insert(documentBrief).values({ documentId: row.id, prompt: fields.prompt });
    return row.id;
  });
}

export async function findBrief(userId: string, documentId: string) {
  await connection();
  const [row] = await db
    .select({ document, brief: documentBrief })
    .from(document)
    .innerJoin(documentBrief, eq(documentBrief.documentId, document.id))
    .where(and(eq(document.id, documentId), eq(document.userId, userId)));
  return row ?? null;
}

export async function saveQuestions(documentId: string, questions: BriefQuestion[], advice: OutlineAdvice, type: string | null) {
  await db.transaction(async (tx) => {
    await tx.update(documentBrief).set({ questions, advice, answers: {}, updatedAt: new Date() }).where(eq(documentBrief.documentId, documentId));
    if (type) await tx.update(document).set({ type }).where(and(eq(document.id, documentId), sql`${document.type} is null`));
  });
}

export async function saveAnswer(documentId: string, questionId: string, answer: string | null) {
  await db
    .update(documentBrief)
    .set({ answers: sql`jsonb_set(${documentBrief.answers}, ARRAY[${questionId}]::text[], ${JSON.stringify(answer)}::jsonb)`, updatedAt: new Date() })
    .where(eq(documentBrief.documentId, documentId));
}

export async function clearAnswer(documentId: string, questionId: string) {
  await db
    .update(documentBrief)
    .set({ answers: sql`${documentBrief.answers} - ${questionId}::text`, updatedAt: new Date() })
    .where(eq(documentBrief.documentId, documentId));
}

export async function saveOutlineMode(documentId: string, outline: OutlineMode) {
  await db.update(documentBrief).set({ outline, updatedAt: new Date() }).where(eq(documentBrief.documentId, documentId));
}

export async function finishDraft(
  userId: string,
  documentId: string,
  fields: { title: string; content: unknown; plainText: string; wordCount: number; lockedCount: number },
) {
  const rows = await db
    .update(document)
    .set({ ...fields, status: "draft", contentVersion: 1, updatedAt: new Date() })
    .where(and(eq(document.id, documentId), eq(document.userId, userId), eq(document.status, "drafting")))
    .returning({ id: document.id });
  if (rows.length > 0) await requestIndexing(userId, documentId);
  return rows.length > 0;
}
