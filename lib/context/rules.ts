import { limits } from "./limits";
import type { RuleKind } from "./schemas";

export function parseRuleEntries(kind: RuleKind, value: string) {
  return (kind === "banned_word" ? value.split(/[,\n]/) : [value]).map((entry) => entry.trim().slice(0, limits.ruleValue)).filter(Boolean);
}

export function freshRuleEntries(kind: RuleKind, entries: string[], existing: { kind: string; value: string }[]) {
  const seen = new Set(existing.filter((row) => row.kind === kind).map((row) => row.value.toLowerCase()));
  const fresh = new Map<string, string>();
  for (const value of entries) if (!seen.has(value.toLowerCase()) && !fresh.has(value.toLowerCase())) fresh.set(value.toLowerCase(), value);
  return [...fresh.values()];
}
