"use client"

import type { ReactNode } from "react"

import { type UIMessage, isTextUIPart } from "ai"
import Link from "next/link"

export type ChatSource = {
  id: number
  artifactId: string
  title: string
  heading: string | null
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("")
}

function getMessageSources(message: UIMessage): ChatSource[] {
  for (const part of message.parts) {
    if (part.type === "data-sources") {
      return ((part as { data?: ChatSource[] }).data ?? []).slice()
    }
  }
  return []
}

function renderWithCitations(
  text: string,
  byId: Map<number, ChatSource>,
  hrefFor: (artifactId: string) => string
): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /\[(\d+)\]/g
  let last = 0
  let key = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(text)) !== null) {
    const source = byId.get(Number(match[1]))
    if (!source) continue

    if (match.index > last) nodes.push(text.slice(last, match.index))
    nodes.push(
      <Link
        key={`cite-${key++}`}
        href={hrefFor(source.artifactId)}
        title={source.title}
        className="mx-0.5 inline-flex items-center rounded bg-primary/10 px-1 align-super text-[0.7em] font-medium text-primary no-underline hover:bg-primary/20"
      >
        {match[1]}
      </Link>
    )
    last = re.lastIndex
  }

  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function CitedMessage({
  message,
  hrefFor,
}: {
  message: UIMessage
  hrefFor: (artifactId: string) => string
}) {
  const text = getMessageText(message)
  const sources = getMessageSources(message)
  const byId = new Map(sources.map((s) => [s.id, s]))

  return (
    <>
      <p className="whitespace-pre-wrap">
        {sources.length > 0 ? renderWithCitations(text, byId, hrefFor) : text}
      </p>

      {sources.length > 0 && (
        <div className="mt-2 border-t border-border/60 pt-2">
          <p className="mb-1 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
            Sources
          </p>
          <ol className="space-y-0.5">
            {sources.map((source) => (
              <li key={source.id} className="flex gap-1.5 text-xs">
                <span className="text-muted-foreground">{source.id}.</span>
                <Link
                  href={hrefFor(source.artifactId)}
                  className="text-primary hover:underline"
                >
                  {source.title}
                  {source.heading ? `: ${source.heading}` : ""}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  )
}
