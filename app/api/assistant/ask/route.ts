import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, streamText } from "ai"
import { NextResponse } from "next/server"

import { ASK_SYSTEM_PROMPT, formatContext } from "@/lib/ai/ai-schema"
import { resolveContextDocuments } from "@/lib/ai/resolve-context"
import { enforceDailyAiLimit } from "@/lib/ai/usage-limit"
import { getSession } from "@/lib/auth"

const MAX_PROMPT_LENGTH = 8000

export async function POST(request: Request) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const limited = await enforceDailyAiLimit(session.user.id)
  if (limited) return limited

  const { messages, workspaceId, artifactMarkdown, contextIds } =
    await request.json()

  const lastUser = [...(messages ?? [])]
    .reverse()
    .find((m: { role: string }) => m.role === "user")
  const userText = (
    (lastUser?.parts ?? []) as { type: string; text?: string }[]
  )
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("")

  if (userText.length > MAX_PROMPT_LENGTH)
    return NextResponse.json({ error: "Prompt is too long" }, { status: 413 })

  const context = await resolveContextDocuments({
    workspaceId,
    userId: session.user.id,
    contextIds: contextIds ?? [],
    query: userText,
  })

  const document = (artifactMarkdown ?? "").trim()
  const system = [
    ASK_SYSTEM_PROMPT,
    `The document the user is asking about:\n\n${document || "(The document is currently empty.)"}`,
    formatContext(context),
  ]
    .filter(Boolean)
    .join("\n\n")

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
