import { z } from "zod";
import { countWords, limits } from "./limits";
import { audienceLevels, isOption } from "./options";

const line = z.string().trim().max(limits.profileLine);
const block = z.string().trim().max(limits.profileField);

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Give the profile a name.").max(limits.name),
  role: line,
  organization: line,
  industry: line,
  about: block,
  region: line,
  firstLanguage: line,
  writingLanguage: line,
  currency: line,
  units: line,
  dateFormat: line,
  audience: block,
  audienceLevel: z
    .string()
    .nullable()
    .refine((value) => value === null || isOption(audienceLevels, value), "Pick one of the listed levels."),
  facts: block,
  signoff: line,
  contact: z.string().trim().max(limits.contact),
});

export const voiceSchema = z.object({
  name: z.string().trim().min(1, "Give the voice a name.").max(limits.name),
  notes: z.string().trim().max(limits.voiceNotes),
});

export const ruleSetSchema = z.object({
  name: z.string().trim().min(1, "Give the rule set a name.").max(limits.name),
  description: z.string().trim().max(limits.ruleSetDescription),
});

export const sampleSchema = z.object({
  title: z.string().trim().min(1, "Give the sample a title.").max(limits.sampleTitle),
  content: z
    .string()
    .trim()
    .max(limits.sampleContent)
    .refine((value) => countWords(value) >= limits.sampleWordsMin, `Paste at least ${limits.sampleWordsMin} words so there is something to learn from.`),
});

export type RuleKind = "banned_word" | "format" | "custom";

export function ruleSchema(kind: RuleKind) {
  return z.object({
    value: z
      .string()
      .trim()
      .min(1, kind === "banned_word" ? "Enter a word or phrase." : "Describe the rule.")
      .max(kind === "banned_word" ? limits.ruleValue * 10 : limits.ruleValue),
  });
}

export type ProfileValues = z.infer<typeof profileSchema>;
export type VoiceValues = z.infer<typeof voiceSchema>;
export type RuleSetValues = z.infer<typeof ruleSetSchema>;
export type SampleValues = z.infer<typeof sampleSchema>;
export type RuleValues = z.infer<ReturnType<typeof ruleSchema>>;
