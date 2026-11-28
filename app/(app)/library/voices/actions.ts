"use server";

import { revalidatePath } from "next/cache";
import { limitMessage } from "~@/lib/billing/plans";
import { getEntitlement } from "~@/lib/db/repository/billing";
import { requireUserId } from "~@/lib/auth/session";
import { countWords, type FormState } from "~@/lib/context/limits";
import { sampleSchema, voiceSchema, type SampleValues, type VoiceValues } from "~@/lib/context/schemas";
import {
  countSamples,
  countVoices,
  insertSample,
  insertVoice,
  listVoices as listVoicesFor,
  ownsVoice,
  removeSample,
  removeVoice,
  updateSampleIncluded,
  updateVoiceFields,
} from "~@/lib/db/repository/voice";

function refresh() {
  revalidatePath("/library", "layout");
}

export async function listVoices() {
  return listVoicesFor(await requireUserId());
}

export async function createVoice(): Promise<{ id: string } | { error: string }> {
  const userId = await requireUserId();
  const { plan, limits } = await getEntitlement(userId);
  if ((await countVoices(userId)) >= limits.voices) return { error: limitMessage(plan, "voices", "voices") };
  const id = await insertVoice(userId);
  refresh();
  return { id };
}

export async function updateVoice(id: string, values: VoiceValues): Promise<FormState> {
  const userId = await requireUserId();
  const parsed = voiceSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const isUpdated = await updateVoiceFields(userId, id, parsed.data);
  if (!isUpdated) return { error: "This voice no longer exists." };
  refresh();
  return { saved: true };
}

export async function deleteVoice(id: string) {
  await removeVoice(await requireUserId(), id);
  refresh();
}

export async function addSample(voiceId: string, values: SampleValues): Promise<FormState> {
  const userId = await requireUserId();
  if (!(await ownsVoice(userId, voiceId))) return { error: "This voice no longer exists." };
  const parsed = sampleSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const entitlement = await getEntitlement(userId);
  if ((await countSamples(voiceId)) >= entitlement.limits.voiceSamples) return { error: limitMessage(entitlement.plan, "samples per voice", "voiceSamples") };
  await insertSample(voiceId, { ...parsed.data, wordCount: countWords(parsed.data.content) });
  refresh();
  return { saved: true };
}

export async function setSampleIncluded(
  voiceId: string,
  sampleId: string,
  isIncluded: boolean,
) {
  if (!(await ownsVoice(await requireUserId(), voiceId))) return;
  await updateSampleIncluded(voiceId, sampleId, isIncluded);
  refresh();
}

export async function deleteSample(voiceId: string, sampleId: string) {
  if (!(await ownsVoice(await requireUserId(), voiceId))) return;
  await removeSample(voiceId, sampleId);
  refresh();
}
