"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "~@/lib/auth/session";
import { limits, spellingOptions, type FormState } from "~@/lib/context/limits";
import { ruleSchema, ruleSetSchema, type RuleKind, type RuleSetValues, type RuleValues } from "~@/lib/context/schemas";
import {
  countRuleSets,
  insertRuleSet,
  insertRules,
  listRules,
  listRuleSets as listRuleSetsFor,
  ownsRuleSet,
  removeRuleById,
  removeRuleSet,
  replaceSpelling,
  updateRuleSetFields,
} from "~@/lib/db/repository/rule-set";

function refresh() {
  revalidatePath("/library", "layout");
}

export async function listRuleSets() {
  return listRuleSetsFor(await requireUserId());
}

export async function createRuleSet() {
  const userId = await requireUserId();
  if ((await countRuleSets(userId)) >= limits.perUser) return null;
  const id = await insertRuleSet(userId);
  refresh();
  return id;
}

export async function updateRuleSet(id: string, values: RuleSetValues): Promise<FormState> {
  const userId = await requireUserId();
  const parsed = ruleSetSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const isUpdated = await updateRuleSetFields(userId, id, parsed.data);
  if (!isUpdated) return { error: "This rule set no longer exists." };
  refresh();
  return { saved: true };
}

export async function deleteRuleSet(id: string) {
  await removeRuleSet(await requireUserId(), id);
  refresh();
}

export async function setSpelling(ruleSetId: string, value: string) {
  if (!(await ownsRuleSet(await requireUserId(), ruleSetId))) return;
  await replaceSpelling(
    ruleSetId,
    spellingOptions.some((option) => option.value === value) ? value : null,
  );
  refresh();
}

export async function addRule(ruleSetId: string, kind: RuleKind, values: RuleValues): Promise<FormState> {
  if (!(await ownsRuleSet(await requireUserId(), ruleSetId))) return { error: "This rule set no longer exists." };
  const parsed = ruleSchema(kind).safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const entries = (kind === "banned_word" ? parsed.data.value.split(/[,\n]/) : [parsed.data.value]).map((value) => value.trim().slice(0, limits.ruleValue)).filter(Boolean);
  if (entries.length === 0) return { error: kind === "banned_word" ? "Enter a word or phrase." : "Describe the rule." };
  const existing = await listRules(ruleSetId);
  if (existing.length + entries.length > limits.rulesMax) return { error: `A rule set holds at most ${limits.rulesMax} rules.` };
  const seen = new Set(existing.filter((row) => row.kind === kind).map((row) => row.value.toLowerCase()));
  const fresh = new Map<string, string>();
  for (const value of entries) if (!seen.has(value.toLowerCase()) && !fresh.has(value.toLowerCase())) fresh.set(value.toLowerCase(), value);
  if (fresh.size === 0) return { error: "That rule is already in the set." };
  await insertRules(ruleSetId, kind, [...fresh.values()]);
  refresh();
  return { saved: true };
}

export async function removeRule(ruleSetId: string, ruleId: string) {
  if (!(await ownsRuleSet(await requireUserId(), ruleSetId))) return;
  await removeRuleById(ruleSetId, ruleId);
  refresh();
}
