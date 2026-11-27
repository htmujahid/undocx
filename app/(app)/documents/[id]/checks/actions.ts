"use server";

import { requireUserId } from "~@/lib/auth/session";
import type { FormState } from "~@/lib/context/limits";
import { findDocument, updateDocumentRuleSet } from "~@/lib/db/repository/document";
import { findRuleSet, listRuleSets } from "~@/lib/db/repository/rule-set";

export async function getRuleChoices(documentId: string) {
  const userId = await requireUserId();
  const doc = await findDocument(userId, documentId);
  if (!doc) return null;
  const [ruleSets, current] = await Promise.all([listRuleSets(userId), doc.ruleSetId ? findRuleSet(userId, doc.ruleSetId) : null]);
  const values = (kind: string) => current?.rules.filter((rule) => rule.kind === kind).map((rule) => rule.value) ?? [];
  return {
    ruleSets: ruleSets.map((set) => ({ id: set.id, name: set.name })),
    current: current ? { id: current.id, name: current.name, spelling: values("spelling")[0] ?? null, banned: values("banned_word"), formats: values("format"), custom: values("custom") } : null,
  };
}

export async function setDocumentRuleSet(documentId: string, ruleSetId: string | null): Promise<FormState> {
  const userId = await requireUserId();
  if (ruleSetId && !(await findRuleSet(userId, ruleSetId))) return { error: "That rule set no longer exists." };
  if (!(await updateDocumentRuleSet(userId, documentId, ruleSetId))) return { error: "This document no longer exists." };
  return { saved: true };
}
