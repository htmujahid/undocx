import { openai } from "@ai-sdk/openai"
import { Output, streamText } from "ai"

import { SYSTEM_PROMPT, outputSchema } from "@/lib/ai-schema"

export async function POST(request: Request) {
  const { prompt } = await request.json()

  const result = streamText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: outputSchema }),
    system: SYSTEM_PROMPT,
    prompt,
  })

  return result.toTextStreamResponse()
}
