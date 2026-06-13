import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, embed, streamText } from "ai"
import { and, eq, sql } from "drizzle-orm"
import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { getWorkspaceRole } from "@/lib/db/access"
import { artifact, artifactChunk } from "@/lib/db/schema"

const SYSTEM_PROMPT = `You are a helpful assistant for a personal knowledge base. Answer questions using only the provided context from the user's documents. If the context does not contain enough information to answer confidently, say so clearly rather than guessing. Be concise and accurate.`

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: workspaceId } = await params
  const role = await getWorkspaceRole(workspaceId, session.user.id)
  if (!role)
    return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { messages } = await req.json()

  const lastUserMessage = [...messages]
    .reverse()
    .find((m: { role: string }) => m.role === "user")

  if (!lastUserMessage)
    return NextResponse.json({ error: "No user message" }, { status: 400 })

  // Extract plain text from UIMessage parts (AI SDK v6 format)
  const userText = (lastUserMessage.parts ?? [])
    .filter((p: { type: string }) => p.type === "text")
    .map((p: { type: string; text: string }) => p.text)
    .join("")

  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: userText,
  })

  const vectorString = `[${queryEmbedding.join(",")}]`

  const chunks = await db
    .select({
      content: artifactChunk.content,
      heading: artifactChunk.heading,
      artifactTitle: artifact.title,
    })
    .from(artifactChunk)
    .innerJoin(artifact, eq(artifactChunk.artifactId, artifact.id))
    .where(
      and(
        eq(artifact.workspaceId, workspaceId),
        eq(artifact.isArchived, false)
      )
    )
    .orderBy(sql`${artifactChunk.embedding} <=> ${vectorString}::vector`)
    .limit(6)

  const context = chunks
    .map(
      (c) =>
        `### ${c.artifactTitle}${c.heading ? ` — ${c.heading}` : ""}\n\n${c.content}`
    )
    .join("\n\n---\n\n")

  const system = context
    ? `${SYSTEM_PROMPT}\n\nRelevant context from the knowledge base:\n\n${context}`
    : `${SYSTEM_PROMPT}\n\nNo relevant context was found in the knowledge base. Let the user know their knowledge base may be empty or not yet indexed.`

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
