import "server-only";

import { openai } from "@ai-sdk/openai";

export const modelId = process.env.OPENAI_MODEL || "gpt-6-astra";

export function getModel() {
  return openai(modelId);
}
