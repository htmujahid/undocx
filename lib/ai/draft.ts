import "server-only";

import { serializeBlocks, type SeedBlock } from "~@/editor/server/serialize";
import type { DraftBlock } from "./schemas";

function toSeed(block: DraftBlock, sourceIds: Set<string>): SeedBlock {
  switch (block.type) {
    case "heading":
      return { type: "heading", tag: block.level, text: block.text };
    case "paragraph":
      return { type: "paragraph", runs: [{ text: block.text }, ...[...new Set(block.cites)].filter((id) => sourceIds.has(id)).slice(0, 3).map((id) => ({ text: "", cite: id }))] };
    case "list":
      return { type: "list", listType: block.ordered ? "number" : "bullet", items: block.items.map((text) => ({ text })) };
    case "quote":
      return { type: "quote", text: block.text };
    case "table":
      return { type: "table", header: block.header, rows: block.rows };
  }
}

export function draftToContent(blocks: DraftBlock[], sourceIds: string[]): unknown {
  const allowed = new Set(sourceIds);
  const usable = blocks.filter((block) => (block.type === "list" ? block.items.length > 0 : block.type === "table" ? block.header.length > 0 : block.text.trim().length > 0));
  return JSON.parse(serializeBlocks(usable.map((block) => toSeed(block, allowed))));
}
