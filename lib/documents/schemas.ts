import { z } from "zod";
import { sourceLimits } from "../sources/limits";
import { documentLimits, versionLimits } from "./limits";

export const titleSchema = z.object({
  title: z.string().trim().min(1, "Give the document a title.").max(documentLimits.title),
});

export const statusSchema = z.enum(["draft", "ready"]);

export const saveSchema = z.object({
  content: z
    .string()
    .max(documentLimits.contentBytes, "This document is too large to save.")
    .transform((value, context) => {
      try {
        const parsed: unknown = JSON.parse(value);
        if (typeof parsed !== "object" || parsed === null || !("root" in parsed)) throw new Error("not an editor state");
        return parsed;
      } catch {
        context.addIssue({ code: "custom", message: "The document content is not valid." });
        return z.NEVER;
      }
    }),
  version: z.number().int().min(0),
});

export type TitleValues = z.infer<typeof titleSchema>;
export type DocumentStatus = z.infer<typeof statusSchema>;

export const startSchema = z.object({
  prompt: z.string().trim().min(10, "Say a little more, at least a sentence.").max(documentLimits.prompt),
  type: z.string().nullable(),
  profileId: z.string().nullable(),
  voiceId: z.string().nullable(),
  ruleSetId: z.string().nullable(),
  sourceIds: z.array(z.string()).max(sourceLimits.perDocument),
});

export const answerSchema = z.object({
  questionId: z.string().min(1).max(60),
  answer: z.string().trim().max(documentLimits.answer).nullable(),
});

export const outlineModeSchema = z.enum(["auto", "on", "off"]);

export type StartValues = z.infer<typeof startSchema>;
export type AnswerValues = z.infer<typeof answerSchema>;

export const customAnswerSchema = z.object({
  answer: z.string().trim().min(1, "Write an answer, or pick one above.").max(documentLimits.answer),
});

export type CustomAnswerValues = z.infer<typeof customAnswerSchema>;

export const noteSchema = z.object({
  markId: z.string().min(1).max(64),
  quote: z.string().max(2000).nullable(),
  text: z.string().trim().min(1).max(4000),
});

export type NoteValues = z.infer<typeof noteSchema>;

export const versionNameSchema = z.object({
  name: z.string().trim().max(versionLimits.name, `Keep the name under ${versionLimits.name} characters.`),
});

export const versionContentSchema = z.string().max(documentLimits.contentBytes, "This document is too large to save.").transform((value, context) => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || !("root" in parsed)) throw new Error("not an editor state");
    return parsed;
  } catch {
    context.addIssue({ code: "custom", message: "The document content is not valid." });
    return z.NEVER;
  }
});

export type VersionNameValues = z.infer<typeof versionNameSchema>;
