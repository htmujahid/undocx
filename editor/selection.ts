import { $findMatchingParent } from "@lexical/utils";
import { $isRootOrShadowRoot, type LexicalNode } from "lexical";

export function $findTopLevelElement(node: LexicalNode) {
  if (node.getKey() === "root") return node;
  const element = $findMatchingParent(node, (candidate) => {
    const parent = candidate.getParent();
    return parent !== null && $isRootOrShadowRoot(parent);
  });
  return element ?? node.getTopLevelElementOrThrow();
}
