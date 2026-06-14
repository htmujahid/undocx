import { openai } from "@ai-sdk/openai"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  embed,
  streamText,
} from "ai"
import { NextResponse } from "next/server"

import { enforceDailyAiLimit } from "@/lib/ai/usage-limit"
import { getSession } from "@/lib/auth"
import { getWorkspaceRole } from "@/lib/db/queries/access"
import { searchWorkspaceChunks } from "@/lib/db/queries/artifact-chunk"

const SYSTEM_PROMPT = `You are a helpful assistant for a personal knowledge base. Answer questions using only the provided context from the user's documents. Each context block is labelled with a numbered source like [1]. When a statement is supported by the context, cite the source inline using its bracketed number, e.g. "Revenue grew last quarter [2]." Cite every claim you draw from the context, and place the citation immediately after the relevant sentence. If the context does not contain enough information to answer confidently, say so clearly rather than guessing. Be concise and accurate.`

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: workspaceId } = await params
  const role = await getWorkspaceRole(workspaceId, session.user.id)
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const limited = await enforceDailyAiLimit(session.user.id)
  if (limited) return limited

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

  const chunks = await searchWorkspaceChunks(workspaceId, queryEmbedding)

  const sources = chunks.map((c, i) => ({
    id: i + 1,
    artifactId: c.artifactId,
    title: c.artifactTitle,
    heading: c.heading,
  }))

  const context = chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.artifactTitle}${c.heading ? `: ${c.heading}` : ""}\n\n${c.content}`
    )
    .join("\n\n---\n\n")

  const system = context
    ? `${SYSTEM_PROMPT}\n\nRelevant context from the knowledge base:\n\n${context}`
    : `${SYSTEM_PROMPT}\n\nNo relevant context was found in the knowledge base. Let the user know their knowledge base may be empty or not yet indexed.`

  const modelMessages = await convertToModelMessages(messages)

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      if (sources.length > 0) {
        writer.write({ type: "data-sources", data: sources })
      }

      const result = streamText({
        model: openai("gpt-4o-mini"),
        system,
        messages: modelMessages,
      })

      writer.merge(result.toUIMessageStream())
    },
  })

  return createUIMessageStreamResponse({ stream })
}
