import "server-only";

import { and, asc, count, desc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "~@/lib/db";
import { rule, ruleSet } from "~@/lib/db/schema";

export type RuleKind = (typeof rule.$inferInsert)["kind"];

export async function listRuleSets(userId: string) {
  await connection();
  const sets = await db
    .select()
    .from(ruleSet)
    .where(eq(ruleSet.userId, userId))
    .orderBy(desc(ruleSet.updatedAt));
  if (sets.length === 0) return [];
  const rows = await db
    .select({ ruleSetId: rule.ruleSetId, kind: rule.kind, value: rule.value })
    .from(rule)
    .innerJoin(ruleSet, eq(rule.ruleSetId, ruleSet.id))
    .where(eq(ruleSet.userId, userId));
  return sets.map((set) => {
    const own = rows.filter((row) => row.ruleSetId === set.id);
    return {
      id: set.id,
      name: set.name,
      description: set.description,
      spelling: own.find((row) => row.kind === "spelling")?.value ?? null,
      banned: own.filter((row) => row.kind === "banned_word").length,
      formats: own.filter((row) => row.kind === "format").length,
      custom: own.filter((row) => row.kind === "custom").length,
    };
  });
}

export async function findRuleSet(userId: string, id: string) {
  await connection();
  const [row] = await db
    .select()
    .from(ruleSet)
    .where(and(eq(ruleSet.id, id), eq(ruleSet.userId, userId)));
  if (!row) return null;
  const rules = await db
    .select()
    .from(rule)
    .where(eq(rule.ruleSetId, id))
    .orderBy(asc(rule.createdAt));
  return { ...row, rules };
}

export async function ownsRuleSet(userId: string, id: string) {
  const [row] = await db
    .select({ id: ruleSet.id })
    .from(ruleSet)
    .where(and(eq(ruleSet.id, id), eq(ruleSet.userId, userId)));
  return row !== undefined;
}

export async function countRuleSets(userId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(ruleSet)
    .where(eq(ruleSet.userId, userId));
  return total;
}

export async function insertRuleSet(userId: string) {
  const [row] = await db
    .insert(ruleSet)
    .values({ userId, name: "Untitled rule set" })
    .returning({ id: ruleSet.id });
  return row.id;
}

export async function updateRuleSetFields(
  userId: string,
  id: string,
  fields: { name: string; description: string },
) {
  const rows = await db
    .update(ruleSet)
    .set(fields)
    .where(and(eq(ruleSet.id, id), eq(ruleSet.userId, userId)))
    .returning({ id: ruleSet.id });
  return rows.length > 0;
}

export async function removeRuleSet(userId: string, id: string) {
  await db
    .delete(ruleSet)
    .where(and(eq(ruleSet.id, id), eq(ruleSet.userId, userId)));
}

async function touch(ruleSetId: string) {
  await db
    .update(ruleSet)
    .set({ updatedAt: new Date() })
    .where(eq(ruleSet.id, ruleSetId));
}

export async function replaceSpelling(ruleSetId: string, value: string | null) {
  await db
    .delete(rule)
    .where(and(eq(rule.ruleSetId, ruleSetId), eq(rule.kind, "spelling")));
  if (value)
    await db.insert(rule).values({ ruleSetId, kind: "spelling", value });
  await touch(ruleSetId);
}

export async function listRules(ruleSetId: string) {
  return db
    .select({ kind: rule.kind, value: rule.value })
    .from(rule)
    .where(eq(rule.ruleSetId, ruleSetId));
}

export async function insertRules(
  ruleSetId: string,
  kind: RuleKind,
  values: string[],
) {
  await db
    .insert(rule)
    .values(values.map((value) => ({ ruleSetId, kind, value })));
  await touch(ruleSetId);
}

export async function removeRuleById(ruleSetId: string, ruleId: string) {
  await db
    .delete(rule)
    .where(and(eq(rule.id, ruleId), eq(rule.ruleSetId, ruleSetId)));
  await touch(ruleSetId);
}
