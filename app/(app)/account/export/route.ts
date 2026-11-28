import { eq, inArray } from "drizzle-orm";
import { connection } from "next/server";
import { getUserId } from "~@/lib/auth/session";
import { db } from "~@/lib/db";
import { aiMessage, aiThread, chatMessage, chatThread, document, documentBrief, documentSource, documentTag, documentVersion, folder, note, rule, ruleSet, source, tag, voice, voiceSample, writerProfile } from "~@/lib/db/schema";

async function within<T>(ids: string[], query: (ids: string[]) => Promise<T[]>) {
  return ids.length > 0 ? query(ids) : [];
}

export async function GET() {
  await connection();
  const userId = await getUserId();
  if (!userId) return Response.json({ error: "Sign in to download your data." }, { status: 401 });

  const [documents, folders, tags, profiles, voices, ruleSets, sources, chats] = await Promise.all([
    db.select().from(document).where(eq(document.userId, userId)),
    db.select().from(folder).where(eq(folder.userId, userId)),
    db.select().from(tag).where(eq(tag.userId, userId)),
    db.select().from(writerProfile).where(eq(writerProfile.userId, userId)),
    db.select().from(voice).where(eq(voice.userId, userId)),
    db.select().from(ruleSet).where(eq(ruleSet.userId, userId)),
    db.select().from(source).where(eq(source.userId, userId)),
    db.select().from(chatThread).where(eq(chatThread.userId, userId)),
  ]);
  const documentIds = documents.map((item) => item.id);
  const [briefs, versions, notes, documentTags, documentSources, assistantThreads, voiceSamples, rules, chatMessages] = await Promise.all([
    within(documentIds, (ids) => db.select().from(documentBrief).where(inArray(documentBrief.documentId, ids))),
    within(documentIds, (ids) => db.select().from(documentVersion).where(inArray(documentVersion.documentId, ids))),
    within(documentIds, (ids) => db.select().from(note).where(inArray(note.documentId, ids))),
    within(documentIds, (ids) => db.select().from(documentTag).where(inArray(documentTag.documentId, ids))),
    within(documentIds, (ids) => db.select().from(documentSource).where(inArray(documentSource.documentId, ids))),
    within(documentIds, (ids) => db.select().from(aiThread).where(inArray(aiThread.documentId, ids))),
    within(voices.map((item) => item.id), (ids) => db.select().from(voiceSample).where(inArray(voiceSample.voiceId, ids))),
    within(ruleSets.map((item) => item.id), (ids) => db.select().from(rule).where(inArray(rule.ruleSetId, ids))),
    within(chats.map((item) => item.id), (ids) => db.select().from(chatMessage).where(inArray(chatMessage.threadId, ids))),
  ]);
  const assistantMessages = await within(assistantThreads.map((item) => item.id), (ids) => db.select().from(aiMessage).where(inArray(aiMessage.threadId, ids)));

  const body = {
    exportedAt: new Date().toISOString(),
    note: "Your documents, notes, versions, library and conversations. Uploaded files are not included here: download each one from its source page.",
    documents: documents.map((item) => ({ ...item, brief: briefs.find((brief) => brief.documentId === item.id) ?? null, versions: versions.filter((version) => version.documentId === item.id), notes: notes.filter((entry) => entry.documentId === item.id), tagIds: documentTags.filter((entry) => entry.documentId === item.id).map((entry) => entry.tagId), sourceIds: documentSources.filter((entry) => entry.documentId === item.id).map((entry) => entry.sourceId), assistantConversation: assistantMessages.filter((message) => assistantThreads.some((thread) => thread.id === message.threadId && thread.documentId === item.id)) })),
    folders,
    tags,
    writerProfiles: profiles,
    voices: voices.map((item) => ({ ...item, samples: voiceSamples.filter((sample) => sample.voiceId === item.id) })),
    ruleSets: ruleSets.map((item) => ({ ...item, rules: rules.filter((entry) => entry.ruleSetId === item.id) })),
    sources,
    chats: chats.map((item) => ({ ...item, messages: chatMessages.filter((message) => message.threadId === item.id) })),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="undocx-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "cache-control": "private, no-store",
    },
  });
}
