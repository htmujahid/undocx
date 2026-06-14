import { openai } from "@ai-sdk/openai"
import { Output, streamText } from "ai"
import { NextResponse } from "next/server"

import { SYSTEM_PROMPT, formatContext, outputSchema } from "@/lib/ai/ai-schema"
import { resolveContextDocuments } from "@/lib/ai/resolve-context"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { workspaceId, contextIds, prompt } = await request.json()

  const context = await resolveContextDocuments({
    workspaceId,
    userId: session.user.id,
    contextIds: contextIds ?? [],
    query: prompt ?? "",
  })

  const contextSection = formatContext(context)

  const result = streamText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: outputSchema }),
    system: SYSTEM_PROMPT,
    prompt: contextSection ? `${contextSection}\n\n${prompt}` : prompt,
  })

  return result.toTextStreamResponse()
}
