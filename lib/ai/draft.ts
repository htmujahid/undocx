import "server-only";

import { serializeBlocks, type SeedBlock } from "~@/editor/server/serialize";
import type { DraftBlock } from "./schemas";

function toSeed(block: DraftBlock, sourceIds: Set<string>): SeedBlock | null {
  switch (block.type) {
    case "heading":
      return block.text.trim() ? { type: "heading", tag: block.level ?? "h2", text: block.text } : null;
    case "paragraph":
      return block.text.trim() ? { type: "paragraph", runs: [{ text: block.text }, ...[...new Set(block.cites)].filter((id) => sourceIds.has(id)).slice(0, 3).map((id) => ({ text: "", cite: id }))] } : null;
    case "list": {
      const items = block.items.map((text) => text.trim()).filter(Boolean);
      return items.length > 0 ? { type: "list", listType: block.ordered ? "number" : "bullet", items: items.map((text) => ({ text })) } : null;
    }
    case "quote":
      return block.text.trim() ? { type: "quote", text: block.text } : null;
    case "table":
      return block.header.length > 0 ? { type: "table", header: block.header, rows: block.rows.filter((row) => row.length > 0) } : null;
  }
}

export function draftToContent(blocks: DraftBlock[], sourceIds: string[]): unknown {
  const allowed = new Set(sourceIds);
  const seeds = blocks.flatMap((block) => toSeed(block, allowed) ?? []);
  return JSON.parse(serializeBlocks(seeds));
}
