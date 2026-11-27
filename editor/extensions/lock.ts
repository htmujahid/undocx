import { $getNodeByKey, $getSelection, $isNodeSelection, $isRangeSelection, $setState, createState, type LexicalEditor, type NodeKey } from "lexical";
import { $findTopLevelElement } from "../selection";

export const lockedState = createState("locked", {
  parse: (value) => value === true,
});

export function toggleBlockLock(editor: LexicalEditor, key: NodeKey) {
  editor.update(() => {
    const node = $getNodeByKey(key);
    if (node) $setState(node, lockedState, (current) => !current);
  });
}

export function toggleSelectedBlockLock(editor: LexicalEditor) {
  editor.update(() => {
    const selection = $getSelection();
    const node = $isRangeSelection(selection) ? selection.anchor.getNode() : $isNodeSelection(selection) ? selection.getNodes()[0] : null;
    if (!node) return;
    const block = $findTopLevelElement(node);
    if (block.getKey() !== "root") $setState(block, lockedState, (current) => !current);
  });
}
