import { openai } from "@ai-sdk/openai"
import { Output, streamText } from "ai"

import {
  REPLACE_SYSTEM_PROMPT,
  formatContext,
  replaceOutputSchema,
} from "@/lib/ai-schema"

export async function POST(request: Request) {
  const { beforeContent, selectedContent, afterContent, prompt, context } =
    await request.json()

  const parts = [
    formatContext(context),
    beforeContent?.trim()
      ? `Content BEFORE the selected section:\n\n${beforeContent}`
      : null,
    selectedContent?.trim()
      ? `SELECTED section to replace:\n\n${selectedContent}`
      : null,
    afterContent?.trim()
      ? `Content AFTER the selected section:\n\n${afterContent}`
      : null,
    `Instruction: ${prompt}`,
  ]
    .filter(Boolean)
    .join("\n\n")

  const result = streamText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: replaceOutputSchema }),
    system: REPLACE_SYSTEM_PROMPT,
    prompt: parts,
  })

  return result.toTextStreamResponse()
}
