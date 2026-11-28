export const limits = {
  name: 80,
  profileField: 1200,
  profileLine: 80,
  contact: 300,
  voiceNotes: 600,
  sampleTitle: 120,
  sampleContent: 30000,
  samplesMin: 3,
  sampleWordsMin: 50,
  samplesMax: 10,
  ruleSetDescription: 300,
  ruleValue: 200,
} as const;

export const spellingOptions = [
  { value: "british", label: "British" },
  { value: "american", label: "American" },
  { value: "canadian", label: "Canadian" },
  { value: "australian", label: "Australian" },
] as const;

export type SpellingValue = (typeof spellingOptions)[number]["value"];

export type FormState = { error?: string; saved?: boolean } | null;

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
