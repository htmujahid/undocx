type LexicalNode = { type?: string; text?: string; children?: LexicalNode[]; $?: { locked?: boolean } };

function textOf(node: LexicalNode): string {
  if (typeof node.text === "string") return node.text;
  if (node.type === "linebreak") return "\n";
  return (node.children ?? []).map(textOf).join(node.type === "root" || node.type === "list" || node.type === "table" || node.type === "tablerow" ? "\n" : "");
}

export function summarizeContent(state: unknown) {
  const root = (state as { root?: LexicalNode }).root;
  const blocks = root?.children ?? [];
  const plainText = blocks
    .map(textOf)
    .filter((line) => line.trim().length > 0)
    .join("\n");
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const lockedCount = blocks.filter((block) => block.$?.locked === true).length;
  return { plainText, wordCount: words, lockedCount };
}
