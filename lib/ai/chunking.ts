import { createHash } from "crypto"

export interface ContentChunk {
  chunkIndex: number
  heading: string | null
  content: string
  hash: string
}

export function chunkMarkdown(title: string, content: string): ContentChunk[] {
  const parts = content.split(/^(?=##\s)/m)
  const chunks: ContentChunk[] = []
  const headingSeen = new Map<string, number>()

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const headingMatch = trimmed.match(/^#{2,}\s+(.+?)(?:\r?\n|$)/)
    const rawHeading = headingMatch ? headingMatch[1].trim() : null

    let heading: string | null = null
    if (rawHeading !== null) {
      const count = (headingSeen.get(rawHeading) ?? 0) + 1
      headingSeen.set(rawHeading, count)
      heading = count === 1 ? rawHeading : `${rawHeading} (${count})`
    }

    const text = heading === null ? `# ${title}\n\n${trimmed}` : trimmed

    chunks.push({
      chunkIndex: chunks.length,
      heading,
      content: text,
      hash: createHash("sha256").update(text).digest("hex"),
    })
  }

  return chunks
}
