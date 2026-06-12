import { openai } from "@ai-sdk/openai"
import { Output, streamText } from "ai"

import { INSERT_SYSTEM_PROMPT, insertOutputSchema } from "@/lib/ai-schema"

export async function POST(request: Request) {
  const { beforeContent, afterContent, prompt } = await request.json()

  const contextPrompt = [
    afterContent?.trim()
      ? `Content BEFORE the insert point:\n\n${beforeContent}\n\nContent AFTER the insert point:\n\n${afterContent}`
      : `Content BEFORE the insert point:\n\n${beforeContent}`,
    `\nInstruction: ${prompt}`,
  ].join("\n")

  const result = streamText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: insertOutputSchema }),
    system: INSERT_SYSTEM_PROMPT,
    prompt: contextPrompt,
  })

  return result.toTextStreamResponse()
}
