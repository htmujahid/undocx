"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "~@/lib/auth/session";
import { findBrief, saveAnswer as saveAnswerFor, saveOutlineMode } from "~@/lib/db/repository/brief";
import { answerSchema, outlineModeSchema, type AnswerValues } from "~@/lib/documents/schemas";
import type { OutlineMode } from "~@/lib/documents/brief";

async function ownedDrafting(id: string) {
  const found = await findBrief(await requireUserId(), id);
  return found && found.document.status === "drafting" ? found : null;
}

export async function saveAnswer(id: string, values: AnswerValues) {
  const parsed = answerSchema.safeParse(values);
  const found = await ownedDrafting(id);
  if (!parsed.success || !found) return;
  if (!found.brief.questions.some((question) => question.id === parsed.data.questionId)) return;
  await saveAnswerFor(id, parsed.data.questionId, parsed.data.answer || null);
}

export async function setOutline(id: string, mode: OutlineMode) {
  const parsed = outlineModeSchema.safeParse(mode);
  if (!parsed.success || !(await ownedDrafting(id))) return;
  await saveOutlineMode(id, parsed.data);
  revalidatePath(`/documents/${id}/setup`);
}
