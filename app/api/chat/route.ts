import { openai } from "@ai-sdk/openai"
import { streamObject } from "ai"

import { SYSTEM_PROMPT, outputSchema } from "@/lib/ai-schema"

export async function POST(request: Request) {
  const { prompt } = await request.json()

  const result = streamObject({
    model: openai("gpt-4o-mini"),
    schema: outputSchema,
    system: SYSTEM_PROMPT,
    prompt,
  })

  return result.toTextStreamResponse()
}
