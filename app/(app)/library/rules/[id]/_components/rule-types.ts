export type RuleKind = "spelling" | "banned_word" | "format" | "custom";
export type RuleData = { id: string; kind: RuleKind; value: string };
