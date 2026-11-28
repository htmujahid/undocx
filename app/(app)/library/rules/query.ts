"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type { RuleKind, RuleSetValues, RuleValues } from "~@/lib/context/schemas";
import {
  addRule,
  createRuleSet,
  type RuleDraft,
  deleteRuleSet,
  listRuleSets,
  removeRule,
  setSpelling,
  updateRuleSet,
} from "./actions";

export const ruleSetsKey = "library/rules";

export type RuleSetSummary = Awaited<ReturnType<typeof listRuleSets>>[number];

export function useRuleSets(initial: RuleSetSummary[]) {
  return useSWR(ruleSetsKey, () => listRuleSets(), {
    fallbackData: initial,
    revalidateOnMount: false,
  }).data;
}

export function useCreateRuleSet() {
  return useSWRMutation(ruleSetsKey, (_key, { arg }: { arg: { values: RuleSetValues; rules: RuleDraft[]; spelling: string | null } }) => createRuleSet(arg.values, arg.rules, arg.spelling));
}

export function useUpdateRuleSet(id: string) {
  return useSWRMutation(ruleSetsKey, (_key, { arg }: { arg: RuleSetValues }) =>
    updateRuleSet(id, arg),
  );
}

export function useDeleteRuleSet(id: string) {
  return useSWRMutation(ruleSetsKey, () => deleteRuleSet(id));
}

export function useSetSpelling(ruleSetId: string) {
  return useSWRMutation(ruleSetsKey, (_key, { arg }: { arg: string }) =>
    setSpelling(ruleSetId, arg),
  );
}

export function useAddRule(ruleSetId: string) {
  return useSWRMutation(
    ruleSetsKey,
    (
      _key,
      {
        arg,
      }: {
        arg: { kind: RuleKind; values: RuleValues };
      },
    ) => addRule(ruleSetId, arg.kind, arg.values),
  );
}

export function useRemoveRule(ruleSetId: string) {
  return useSWRMutation(ruleSetsKey, (_key, { arg }: { arg: string }) =>
    removeRule(ruleSetId, arg),
  );
}
