import { z } from "zod";

export const assistantMessageSchema = z.object({
  text: z.string().trim().min(1, "Write a message first.").max(4000, "Keep it under 4,000 characters."),
});

export type AssistantMessageValues = z.infer<typeof assistantMessageSchema>;

const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), level: z.enum(["h1", "h2", "h3"]), text: z.string() }),
  z.object({ type: z.literal("paragraph"), text: z.string(), cites: z.array(z.string()) }),
  z.object({ type: z.literal("list"), ordered: z.boolean(), items: z.array(z.string()) }),
  z.object({ type: z.literal("quote"), text: z.string() }),
  z.object({ type: z.literal("table"), header: z.array(z.string()), rows: z.array(z.array(z.string())) }),
]);

export const questionsOutputSchema = z.object({
  type: z.enum(["proposal", "report", "article", "case-study", "newsletter", "other"]),
  questions: z.array(z.object({ id: z.string(), question: z.string(), choices: z.array(z.string()) })),
  outline: z.object({ recommended: z.boolean(), reason: z.string() }),
});

export const draftOutputSchema = z.object({
  title: z.string(),
  note: z.string(),
  blocks: z.array(blockSchema),
});

export type DraftBlock = z.infer<typeof blockSchema>;
