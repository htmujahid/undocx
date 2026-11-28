"use server";

import { revalidatePath } from "next/cache";
import { limitMessage } from "~@/lib/billing/plans";
import { getEntitlement } from "~@/lib/db/repository/billing";
import { requireUserId } from "~@/lib/auth/session";
import { spellingOptions, type FormState } from "~@/lib/context/limits";
import { freshRuleEntries, parseRuleEntries } from "~@/lib/context/rules";
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

export type RuleDraft = { kind: RuleKind; value: string };

export async function createRuleSet(values: RuleSetValues, rules: RuleDraft[] = [], spelling: string | null = null): Promise<{ id: string } | { error: string }> {
  const userId = await requireUserId();
  const parsed = ruleSetSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const rows: { kind: RuleKind | "spelling"; value: string }[] = [];
  if (spelling) {
    if (!spellingOptions.some((option) => option.value === spelling)) return { error: "Pick one of the listed spellings." };
    rows.push({ kind: "spelling", value: spelling });
  }
  for (const draft of rules) {
    const checked = ruleSchema(draft.kind).safeParse({ value: draft.value });
    if (!checked.success) return { error: checked.error.issues[0].message };
    const fresh = freshRuleEntries(draft.kind, parseRuleEntries(draft.kind, checked.data.value), rows);
    for (const value of fresh) rows.push({ kind: draft.kind, value });
  }
  const { plan, limits: planLimits } = await getEntitlement(userId);
  if ((await countRuleSets(userId)) >= planLimits.ruleSets) return { error: limitMessage(plan, "rule sets", "ruleSets") };
  if (rows.length > planLimits.rulesPerSet) return { error: limitMessage(plan, "rules per set", "rulesPerSet") };
  const id = await insertRuleSet(userId, parsed.data, rows as { kind: RuleKind; value: string }[]);
  refresh();
  return { id };
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
  const userId = await requireUserId();
  if (!(await ownsRuleSet(userId, ruleSetId))) return { error: "This rule set no longer exists." };
  const parsed = ruleSchema(kind).safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const entries = parseRuleEntries(kind, parsed.data.value);
  if (entries.length === 0) return { error: kind === "banned_word" ? "Enter a word or phrase." : "Describe the rule." };
  const existing = await listRules(ruleSetId);
  const entitlement = await getEntitlement(userId);
  if (existing.length + entries.length > entitlement.limits.rulesPerSet) return { error: limitMessage(entitlement.plan, "rules per set", "rulesPerSet") };
  const fresh = freshRuleEntries(kind, entries, existing);
  if (fresh.length === 0) return { error: "That rule is already in the set." };
  await insertRules(ruleSetId, kind, fresh);
  refresh();
  return { saved: true };
}

export async function removeRule(ruleSetId: string, ruleId: string) {
  if (!(await ownsRuleSet(await requireUserId(), ruleSetId))) return;
  await removeRuleById(ruleSetId, ruleId);
  refresh();
}
