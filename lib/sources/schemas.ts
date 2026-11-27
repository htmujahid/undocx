import { z } from "zod";
import { sourceLimits } from "./limits";

const title = z.string().trim().min(1, "Give the source a title.").max(sourceLimits.title);

export const textSourceSchema = z.object({
  title,
  content: z.string().trim().min(sourceLimits.textMin, `Paste at least ${sourceLimits.textMin} characters.`).max(sourceLimits.content, "That is too long. Paste the relevant part."),
});

export const linkSourceSchema = z.object({
  title,
  url: z
    .string()
    .trim()
    .max(2000)
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    }, "That link does not look right. Start it with https://"),
});

export const renameSourceSchema = z.object({ title });

export type TextSourceValues = z.infer<typeof textSourceSchema>;
export type LinkSourceValues = z.infer<typeof linkSourceSchema>;
export type RenameSourceValues = z.infer<typeof renameSourceSchema>;

export const sourceSearchSchema = z.object({
  query: z.string().trim().max(sourceLimits.searchQuery).default(""),
  offset: z.number().int().min(0).max(10_000).default(0),
  excludeDocumentId: z.string().max(64).optional(),
});

export type SourceSearchInput = z.input<typeof sourceSearchSchema>;
