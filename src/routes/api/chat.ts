import { createFileRoute } from "@tanstack/react-router"
import { chat, toServerSentEventsResponse } from "@tanstack/ai"
import { openaiText } from "@tanstack/ai-openai"

import { SYSTEM_PROMPT, outputSchema } from "@/lib/ai-schema"

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { messages } = await request.json()

        const stream = chat({
          adapter: openaiText("gpt-4o-mini"),
          messages,
          stream: true as const,
          outputSchema,
          systemPrompts: [SYSTEM_PROMPT],
        })

        return toServerSentEventsResponse(stream)
      },
    },
  },
})
