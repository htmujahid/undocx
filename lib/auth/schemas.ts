import { z } from "zod";

export const deleteAccountSchema = z.object({
  confirmation: z.string().refine((value) => value.trim() === "DELETE", "Type DELETE to confirm."),
});

export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;
