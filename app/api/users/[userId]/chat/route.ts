import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, embed, streamText } from "ai"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { searchPublicUserChunks } from "@/lib/db/queries/artifact-chunk"
import { getUserById } from "@/lib/db/queries/user"

const SYSTEM_PROMPT = `You are a helpful assistant for a personal knowledge base. Answer questions using only the provided context from the user's public documents. If the context does not contain enough information to answer confidently, say so clearly rather than guessing. Be concise and accurate.`

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { userId } = await params

  const targetUser = await getUserById(userId)
  if (!targetUser)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { messages } = await req.json()

  const lastUserMessage = [...messages]
    .reverse()
    .find((m: { role: string }) => m.role === "user")

  if (!lastUserMessage)
    return NextResponse.json({ error: "No user message" }, { status: 400 })

  const userText = (lastUserMessage.parts ?? [])
    .filter((p: { type: string }) => p.type === "text")
    .map((p: { type: string; text: string }) => p.text)
    .join("")

  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: userText,
  })

  const chunks = await searchPublicUserChunks(userId, queryEmbedding)

  const context = chunks
    .map(
      (c) =>
        `### ${c.artifactTitle}${c.heading ? ` — ${c.heading}` : ""}\n\n${c.content}`
    )
    .join("\n\n---\n\n")

  const system = context
    ? `${SYSTEM_PROMPT}\n\nRelevant context from the knowledge base:\n\n${context}`
    : `${SYSTEM_PROMPT}\n\nNo relevant context was found. Let the user know the knowledge base may not have content on this topic.`

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
