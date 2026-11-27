import { z } from "zod";

export const assistantMessageSchema = z.object({
  text: z.string().trim().min(1, "Write a message first.").max(4000, "Keep it under 4,000 characters."),
});

export const assistantRequestSchema = z.object({
  message: assistantMessageSchema,
  document: z.string().max(200_000),
  focus: z.string().max(2000).nullable().optional(),
});

export type AssistantMessageValues = z.infer<typeof assistantMessageSchema>;

const blockSchema = z.object({
  type: z.enum(["heading", "paragraph", "list", "quote", "table"]),
  level: z.enum(["h1", "h2", "h3"]).nullable().describe("Heading level. Only for a heading block, otherwise null."),
  text: z.string().describe("The text of a heading, paragraph or quote. Empty for a list or table."),
  cites: z.array(z.string()).describe("Source ids a paragraph rests on. Empty for any other block."),
  ordered: z.boolean().describe("For a list: true for a numbered list. Otherwise false."),
  items: z.array(z.string()).describe("The items of a list. Empty for any other block."),
  header: z.array(z.string()).describe("The header cells of a table. Empty for any other block."),
  rows: z.array(z.array(z.string())).describe("The body rows of a table. Empty for any other block."),
});

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

export const editLimits = { items: 40, text: 8000, instruction: 500, context: 1500 } as const;

const editItemSchema = z.object({
  index: z.number().int().min(0).max(editLimits.items),
  kind: z.enum(["selection", "paragraph", "heading", "quote", "list", "other"]),
  text: z.string().max(editLimits.text),
  locked: z.boolean(),
});

const editContextSchema = z.object({
  title: z.string().max(300),
  before: z.string().max(editLimits.context),
  after: z.string().max(editLimits.context),
});

export const rewriteRequestSchema = z.object({
  action: z.enum(["rewrite", "regenerate"]),
  instruction: z.string().trim().max(editLimits.instruction).nullable(),
  items: z.array(editItemSchema).min(1).max(editLimits.items),
  focus: z.array(z.number().int().min(0).max(editLimits.items)).min(1).max(editLimits.items),
  context: editContextSchema,
});

export const variationsRequestSchema = z.object({
  instruction: z.string().trim().max(editLimits.instruction).nullable(),
  item: editItemSchema,
  context: editContextSchema,
});

export const rewriteOutputSchema = z.object({
  items: z.array(z.object({ index: z.number(), text: z.string() })),
});

export const variationsOutputSchema = z.object({
  variations: z.array(z.string()),
});

export type RewriteRequest = z.infer<typeof rewriteRequestSchema>;
export type VariationsRequest = z.infer<typeof variationsRequestSchema>;

export const claimsLimits = { blocks: 60, text: 6000, claims: 60 } as const;

export const claimsRequestSchema = z.object({
  blocks: z
    .array(z.object({ index: z.number().int().min(0).max(500), kind: z.enum(["paragraph", "list", "quote", "table"]), text: z.string().max(claimsLimits.text) }))
    .min(1)
    .max(claimsLimits.blocks),
});

export const claimsOutputSchema = z.object({
  claims: z.array(
    z.object({
      blockIndex: z.number().describe("The index of the block the claim is in."),
      text: z.string().describe("The claim, copied word for word from the block, without any {{cite:ID}} marker."),
      kind: z.enum(["number", "date", "quote", "statement"]),
      status: z.enum(["cited", "uncited", "unsourced", "unsupported", "contradicted"]),
      sourceId: z.string().nullable().describe("The id of the source that supports, fails to support, or contradicts the claim. Null when there is none."),
      note: z.string().describe("One short sentence: what the source says, or why nothing supports the claim."),
    }),
  ),
});

export type ClaimsRequest = z.infer<typeof claimsRequestSchema>;
