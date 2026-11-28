import { createHash } from "node:crypto";

type LexicalNode = { type?: string; tag?: string; text?: string; children?: LexicalNode[] };

export type Chunk = { position: number; blockStart: number; blockEnd: number; headingPath: string; text: string; hash: string };

export const chunkSizes = { target: 1600, max: 2800, overlap: 240 } as const;

function inline(node: LexicalNode): string {
  if (typeof node.text === "string") return node.text;
  if (node.type === "linebreak") return "\n";
  return (node.children ?? []).map(inline).join("");
}

function blockText(node: LexicalNode): string {
  const children = node.children ?? [];
  if (node.type === "list") return children.map((item) => `- ${blockText(item).replace(/\n+/g, " ")}`).join("\n");
  if (node.type === "table") {
    return children
      .map((row) =>
        (row.children ?? [])
          .map((cell) => inline(cell).replace(/\s+/g, " ").trim())
          .join(" | "),
      )
      .filter((row) => row.replace(/[\s|]/g, ""))
      .join("\n");
  }
  if (node.type === "listitem") return children.some((child) => child.type === "list") ? children.map(blockText).join("\n") : inline(node);
  return inline(node);
}

function splitLong(text: string) {
  const sentences = text.split(/(?<=[.!?])\s+/).flatMap((sentence) => {
    if (sentence.length <= chunkSizes.target) return [sentence];
    const parts: string[] = [];
    for (let at = 0; at < sentence.length; at += chunkSizes.target) parts.push(sentence.slice(at, at + chunkSizes.target));
    return parts;
  });
  const pieces: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && current.length + sentence.length + 1 > chunkSizes.target) {
      pieces.push(current);
      const tail = current.slice(-chunkSizes.overlap);
      current = tail.slice(tail.search(/\s/) + 1);
    }
    current = current ? `${current} ${sentence}` : sentence;
  }
  if (current.trim()) pieces.push(current);
  return pieces;
}

export function embeddingInput(title: string, chunk: Pick<Chunk, "headingPath" | "text">) {
  return `${[title, chunk.headingPath].filter(Boolean).join(" > ")}\n\n${chunk.text}`;
}

export function chunkDocument(state: unknown, title: string): Chunk[] {
  const blocks = (state as { root?: LexicalNode } | null)?.root?.children ?? [];
  const chunks: Chunk[] = [];
  const headings: string[] = [];
  let pending: { start: number; end: number; parts: string[]; length: number; path: string } | null = null;

  const emit = (blockStart: number, blockEnd: number, path: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const hash = createHash("sha256").update(`${title}\n${path}\n${trimmed}`).digest("hex");
    chunks.push({ position: chunks.length, blockStart, blockEnd, headingPath: path, text: trimmed, hash });
  };
  const flush = () => {
    if (pending) emit(pending.start, pending.end, pending.path, pending.parts.join("\n\n"));
    pending = null;
  };

  blocks.forEach((block, index) => {
    const text = blockText(block).trim();
    if (!text) return;
    if (block.type === "heading") {
      flush();
      const level = Math.min(Math.max(Number(block.tag?.slice(1)) || 1, 1), 6);
      headings.length = level - 1;
      headings[level - 1] = text.replace(/\s+/g, " ");
      return;
    }
    const path = headings.filter(Boolean).join(" > ");
    if (text.length > chunkSizes.max) {
      flush();
      for (const piece of splitLong(text)) emit(index, index, path, piece);
      return;
    }
    if (pending && (pending.path !== path || pending.length + text.length > chunkSizes.target)) flush();
    if (!pending) pending = { start: index, end: index, parts: [], length: 0, path };
    pending.parts.push(text);
    pending.length += text.length;
    pending.end = index;
  });
  flush();
  return chunks;
}
