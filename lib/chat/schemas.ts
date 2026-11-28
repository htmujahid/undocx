import { z } from "zod";

export const chatMessageSchema = z.object({
  text: z.string().trim().min(1, "Ask a question first.").max(1000, "Keep it under 1,000 characters."),
});

export type ChatMessageValues = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
  message: chatMessageSchema,
  documentId: z.string().max(64).nullable().optional(),
});

export type ChatSource = { n: number; documentId: string; title: string; section: string; text: string };

export type ChatMetadata = { sources: ChatSource[] };

export const chatLimits = { excerpts: 8, minSimilarity: 0.3 } as const;
