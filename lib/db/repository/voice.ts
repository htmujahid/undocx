import "server-only";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { connection } from "next/server";
import { limits } from "~@/lib/context/limits";
import { db } from "~@/lib/db";
import { voice, voiceSample } from "~@/lib/db/schema";

export async function listVoices(userId: string) {
  await connection();
  const included =
    sql<number>`count(${voiceSample.id}) filter (where ${voiceSample.isIncluded})`.mapWith(
      Number,
    );
  const rows = await db
    .select({
      id: voice.id,
      name: voice.name,
      notes: voice.notes,
      updatedAt: voice.updatedAt,
      samples: count(voiceSample.id),
      included,
    })
    .from(voice)
    .leftJoin(voiceSample, eq(voiceSample.voiceId, voice.id))
    .where(eq(voice.userId, userId))
    .groupBy(voice.id)
    .orderBy(desc(voice.updatedAt));
  return rows.map((row) => ({
    ...row,
    isReady: row.included >= limits.samplesMin,
  }));
}

export async function findVoice(userId: string, id: string) {
  await connection();
  const [row] = await db
    .select()
    .from(voice)
    .where(and(eq(voice.id, id), eq(voice.userId, userId)));
  if (!row) return null;
  const samples = await db
    .select()
    .from(voiceSample)
    .where(eq(voiceSample.voiceId, id))
    .orderBy(asc(voiceSample.createdAt));
  const included = samples.filter((sample) => sample.isIncluded).length;
  return { ...row, samples, included, isReady: included >= limits.samplesMin };
}

export async function ownsVoice(userId: string, id: string) {
  const [row] = await db
    .select({ id: voice.id })
    .from(voice)
    .where(and(eq(voice.id, id), eq(voice.userId, userId)));
  return row !== undefined;
}

export async function countVoices(userId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(voice)
    .where(eq(voice.userId, userId));
  return total;
}

export async function insertVoice(userId: string, fields: { name: string; notes: string }, samples: { title: string; content: string; wordCount: number; isIncluded: boolean }[] = []) {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(voice)
      .values({ userId, ...fields })
      .returning({ id: voice.id });
    if (samples.length > 0) await tx.insert(voiceSample).values(samples.map((sample) => ({ voiceId: row.id, ...sample })));
    return row.id;
  });
}

export async function updateVoiceFields(
  userId: string,
  id: string,
  fields: { name: string; notes: string },
) {
  const rows = await db
    .update(voice)
    .set(fields)
    .where(and(eq(voice.id, id), eq(voice.userId, userId)))
    .returning({ id: voice.id });
  return rows.length > 0;
}

export async function removeVoice(userId: string, id: string) {
  await db.delete(voice).where(and(eq(voice.id, id), eq(voice.userId, userId)));
}

export async function countSamples(voiceId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(voiceSample)
    .where(eq(voiceSample.voiceId, voiceId));
  return total;
}

async function resetSummary(voiceId: string) {
  await db
    .update(voice)
    .set({ summary: null, summarizedAt: null })
    .where(eq(voice.id, voiceId));
}

export async function insertSample(
  voiceId: string,
  sample: { title: string; content: string; wordCount: number },
) {
  await db.insert(voiceSample).values({ voiceId, ...sample });
  await resetSummary(voiceId);
}

export async function updateSampleIncluded(
  voiceId: string,
  sampleId: string,
  isIncluded: boolean,
) {
  await db
    .update(voiceSample)
    .set({ isIncluded })
    .where(and(eq(voiceSample.id, sampleId), eq(voiceSample.voiceId, voiceId)));
  await resetSummary(voiceId);
}

export async function removeSample(voiceId: string, sampleId: string) {
  await db
    .delete(voiceSample)
    .where(and(eq(voiceSample.id, sampleId), eq(voiceSample.voiceId, voiceId)));
  await resetSummary(voiceId);
}
