import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "~@/lib/db";
import { writerProfile } from "~@/lib/db/schema";

export type ProfileFields = Partial<
  Omit<
    typeof writerProfile.$inferInsert,
    "id" | "userId" | "isDefault" | "createdAt" | "updatedAt"
  >
>;

export async function listProfiles(userId: string) {
  await connection();
  return db
    .select()
    .from(writerProfile)
    .where(eq(writerProfile.userId, userId))
    .orderBy(desc(writerProfile.isDefault), desc(writerProfile.updatedAt));
}

export async function findProfile(userId: string, id: string) {
  await connection();
  const [row] = await db
    .select()
    .from(writerProfile)
    .where(and(eq(writerProfile.id, id), eq(writerProfile.userId, userId)));
  return row ?? null;
}

export async function countProfiles(userId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(writerProfile)
    .where(eq(writerProfile.userId, userId));
  return total;
}

export async function insertProfile(userId: string, isDefault: boolean) {
  const [row] = await db
    .insert(writerProfile)
    .values({ userId, name: "Untitled profile", isDefault })
    .returning({ id: writerProfile.id });
  return row.id;
}

export async function updateProfileFields(
  userId: string,
  id: string,
  fields: ProfileFields,
) {
  const rows = await db
    .update(writerProfile)
    .set(fields)
    .where(and(eq(writerProfile.id, id), eq(writerProfile.userId, userId)))
    .returning({ id: writerProfile.id });
  return rows.length > 0;
}

export async function makeDefaultProfile(userId: string, id: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(writerProfile)
      .set({ isDefault: false })
      .where(
        and(
          eq(writerProfile.userId, userId),
          eq(writerProfile.isDefault, true),
        ),
      );
    await tx
      .update(writerProfile)
      .set({ isDefault: true })
      .where(and(eq(writerProfile.id, id), eq(writerProfile.userId, userId)));
  });
}

export async function unsetDefaultProfile(userId: string, id: string) {
  await db
    .update(writerProfile)
    .set({ isDefault: false })
    .where(and(eq(writerProfile.id, id), eq(writerProfile.userId, userId)));
}

export async function removeProfile(userId: string, id: string) {
  await db
    .delete(writerProfile)
    .where(and(eq(writerProfile.id, id), eq(writerProfile.userId, userId)));
}
