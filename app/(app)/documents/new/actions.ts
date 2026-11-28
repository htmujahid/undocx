"use server";

import { revalidatePath } from "next/cache";
import { limitMessage } from "~@/lib/billing/plans";
import { getEntitlement } from "~@/lib/db/repository/billing";
import { requireUserId } from "~@/lib/auth/session";
import { insertDraftingDocument } from "~@/lib/db/repository/brief";
import { countDocuments } from "~@/lib/db/repository/document";
import { findProfile } from "~@/lib/db/repository/profile";
import { ownsRuleSet } from "~@/lib/db/repository/rule-set";
import { attachSources } from "~@/lib/db/repository/source";
import { ownsVoice } from "~@/lib/db/repository/voice";
import { startSchema, type StartValues } from "~@/lib/documents/schemas";
import { findDocumentType } from "~@/lib/documents/types";

export type StartResult = { id: string } | { error: string };

export async function startDocument(values: StartValues): Promise<StartResult> {
  const userId = await requireUserId();
  const parsed = startSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { prompt, type, profileId, voiceId, ruleSetId, sourceIds } = parsed.data;
  if (type && !findDocumentType(type)) return { error: "Pick one of the listed document types." };
  if (profileId && !(await findProfile(userId, profileId))) return { error: "That profile no longer exists." };
  if (voiceId && !(await ownsVoice(userId, voiceId))) return { error: "That voice no longer exists." };
  if (ruleSetId && !(await ownsRuleSet(userId, ruleSetId))) return { error: "That rule set no longer exists." };
  const { plan, limits } = await getEntitlement(userId);
  if ((await countDocuments(userId)) >= limits.documents) return { error: limitMessage(plan, "documents", "documents") };
  if (sourceIds.length > limits.sourcesPerDocument) return { error: limitMessage(plan, "sources per document", "sourcesPerDocument") };
  const title = prompt.replace(/\s+/g, " ").slice(0, 60);
  const id = await insertDraftingDocument(userId, { title, prompt, type, profileId, voiceId, ruleSetId });
  await attachSources(userId, id, sourceIds);
  revalidatePath("/documents", "layout");
  revalidatePath("/library", "layout");
  return { id };
}
