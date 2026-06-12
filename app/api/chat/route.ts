import { openai } from "@ai-sdk/openai"
import { Output, streamText } from "ai"

import { SYSTEM_PROMPT, formatContext, outputSchema } from "@/lib/ai-schema"

export async function POST(request: Request) {
  const { prompt, context } = await request.json()

  const contextSection = formatContext(context)

  const result = streamText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: outputSchema }),
    system: SYSTEM_PROMPT,
    prompt: contextSection ? `${contextSection}\n\n${prompt}` : prompt,
  })

  return result.toTextStreamResponse()
}
