import { openai } from "@ai-sdk/openai"
import { Output, streamText } from "ai"
import { NextResponse } from "next/server"

import {
  INSERT_SYSTEM_PROMPT,
  formatContext,
  insertOutputSchema,
} from "@/lib/ai/ai-schema"
import { resolveContextDocuments } from "@/lib/ai/resolve-context"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { workspaceId, contextIds, beforeContent, afterContent, prompt } =
    await request.json()

  const context = await resolveContextDocuments({
    workspaceId,
    userId: session.user.id,
    contextIds: contextIds ?? [],
    query: [prompt, beforeContent, afterContent].filter(Boolean).join("\n\n"),
  })

  const contextPrompt = [
    formatContext(context),
    afterContent?.trim()
      ? `Content BEFORE the insert point:\n\n${beforeContent}\n\nContent AFTER the insert point:\n\n${afterContent}`
      : `Content BEFORE the insert point:\n\n${beforeContent}`,
    `\nInstruction: ${prompt}`,
  ]
    .filter(Boolean)
    .join("\n")

  const result = streamText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: insertOutputSchema }),
    system: INSERT_SYSTEM_PROMPT,
    prompt: contextPrompt,
  })

  return result.toTextStreamResponse()
}
