import "server-only";

import { and, asc, eq, inArray, notInArray } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "~@/lib/db";
import { note } from "~@/lib/db/schema";

export async function listNotes(documentId: string) {
  await connection();
  return db.select().from(note).where(eq(note.documentId, documentId)).orderBy(asc(note.createdAt));
}

export async function upsertNote(documentId: string, fields: { markId: string; quote: string | null; text: string }) {
  await db
    .insert(note)
    .values({ documentId, ...fields })
    .onConflictDoUpdate({ target: [note.documentId, note.markId], set: { quote: fields.quote, text: fields.text, updatedAt: new Date() } });
}

export async function removeNotes(documentId: string, markIds: string[]) {
  if (markIds.length === 0) return;
  await db.delete(note).where(and(eq(note.documentId, documentId), inArray(note.markId, markIds)));
}

export async function keepOnlyNotes(documentId: string, markIds: string[]) {
  await db.delete(note).where(and(eq(note.documentId, documentId), markIds.length > 0 ? notInArray(note.markId, markIds) : undefined));
}
