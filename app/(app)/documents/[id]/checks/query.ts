"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { getRuleChoices, setDocumentRuleSet } from "./actions";

const key = (documentId: string) => `checks/${documentId}/rules`;

export type RuleChoices = NonNullable<Awaited<ReturnType<typeof getRuleChoices>>>;

export function useRuleChoices(documentId: string) {
  return useSWR(key(documentId), () => getRuleChoices(documentId));
}

export function useSetRuleSet(documentId: string) {
  return useSWRMutation(key(documentId), (_key, { arg }: { arg: string | null }) => setDocumentRuleSet(documentId, arg));
}
