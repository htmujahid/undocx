import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, streamText } from "ai"
import { NextResponse } from "next/server"

import { ASK_SYSTEM_PROMPT, formatContext } from "@/lib/ai/ai-schema"
import { resolveContextDocuments } from "@/lib/ai/resolve-context"
import { enforceDailyAiLimit } from "@/lib/ai/usage-limit"
import { getSession } from "@/lib/auth"

const MAX_PROMPT_LENGTH = 8000

const SELECTION_START = "<!-- @selection:start -->"
const SELECTION_END = "<!-- @selection:end -->"

type ParsedSelection =
  | { kind: "none"; cleanDocument: string }
  | { kind: "cursor"; cleanDocument: string; before: string; after: string }
  | { kind: "range"; cleanDocument: string; selectedText: string }

function parseDocumentSelection(raw: string): ParsedSelection {
  const startIdx = raw.indexOf(SELECTION_START)
  const endIdx = raw.indexOf(SELECTION_END)

  if (startIdx === -1) return { kind: "none", cleanDocument: raw }

  const before = raw.slice(0, startIdx).trim()

  if (endIdx === -1 || endIdx <= startIdx) {
    const after = raw.slice(startIdx + SELECTION_START.length).trim()
    return {
      kind: "cursor",
      cleanDocument: [before, after].filter(Boolean).join("\n\n"),
      before,
      after,
    }
  }

  const selected = raw.slice(startIdx + SELECTION_START.length, endIdx).trim()
  const after = raw.slice(endIdx + SELECTION_END.length).trim()
  return {
    kind: "range",
    cleanDocument: [before, selected, after].filter(Boolean).join("\n\n"),
    selectedText: selected,
  }
}

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

  const parsed = parseDocumentSelection((artifactMarkdown ?? "").trim())

  const selectionSection =
    parsed.kind === "range"
      ? `The user has highlighted a specific region in the document. When they refer to "this", "the selected text", "this section", or similar, they are referring to this region:\n\n${parsed.selectedText}`
      : parsed.kind === "cursor"
        ? `The user has placed a cursor marker at a specific position in the document. Their question likely relates to that position.\n\nContent before the cursor:\n\n${parsed.before || "(nothing)"}\n\nContent after the cursor:\n\n${parsed.after || "(nothing)"}`
        : null

  const system = [
    ASK_SYSTEM_PROMPT,
    `The document the user is asking about:\n\n${parsed.cleanDocument || "(The document is currently empty.)"}`,
    selectionSection,
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
