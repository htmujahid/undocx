import { openai } from "@ai-sdk/openai"
import { Output, streamText } from "ai"
import { NextResponse } from "next/server"

import {
  REPLACE_SYSTEM_PROMPT,
  formatContext,
  replaceOutputSchema,
} from "@/lib/ai/ai-schema"
import { resolveContextDocuments } from "@/lib/ai/resolve-context"
import { enforceDailyAiLimit } from "@/lib/ai/usage-limit"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const limited = await enforceDailyAiLimit(session.user.id)
  if (limited) return limited

  const {
    workspaceId,
    contextIds,
    beforeContent,
    selectedContent,
    afterContent,
    prompt,
  } = await request.json()

  const context = await resolveContextDocuments({
    workspaceId,
    userId: session.user.id,
    contextIds: contextIds ?? [],
    query: [prompt, selectedContent, beforeContent, afterContent]
      .filter(Boolean)
      .join("\n\n"),
  })

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
