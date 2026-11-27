import { EditorStateExtension } from "@lexical/extension";
import { defineImportRule, DOMImportExtension, sel } from "@lexical/html";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { $findMatchingParent, $insertNodeToNearestRoot, $onEscapeDown, $onEscapeUp } from "@lexical/utils";
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  configExtension,
  createCommand,
  defineExtension,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  mergeRegister,
  type LexicalCommand,
  type NodeKey,
} from "lexical";
import { $createLayoutContainerNode, $isLayoutContainerNode, LayoutContainerNode } from "../nodes/layout-container-node";
import { $createLayoutItemNode, $isLayoutItemNode, LayoutItemNode } from "../nodes/layout-item-node";

export const INSERT_LAYOUT_COMMAND: LexicalCommand<string> = createCommand("INSERT_LAYOUT_COMMAND");
export const UPDATE_LAYOUT_COMMAND: LexicalCommand<{ template: string; nodeKey: NodeKey }> = createCommand("UPDATE_LAYOUT_COMMAND");
export const REMOVE_LAYOUT_COMMAND: LexicalCommand<NodeKey> = createCommand("REMOVE_LAYOUT_COMMAND");

export const layoutTemplates = [2, 3, 4].map((columns) => ({ label: `${columns} columns`, value: Array(columns).fill("1fr").join(" ") }));

function columnsOf(template: string) {
  return template.trim().split(/\s+/).length;
}

const containerImportRule = defineImportRule({
  name: "undocx/layout-container",
  match: sel.tag("div").attr("data-lexical-layout-container", true),
  $import: (ctx, el) => [$createLayoutContainerNode(el.style.gridTemplateColumns).splice(0, 0, ctx.$importChildren(el))],
});

const itemImportRule = defineImportRule({
  name: "undocx/layout-item",
  match: sel.tag("div").attr("data-lexical-layout-item", true),
  $import: (ctx, el) => [$createLayoutItemNode().splice(0, 0, ctx.$importChildren(el))],
});

export const LayoutExtension = defineExtension({
  name: "undocx/Layout",
  nodes: [LayoutContainerNode, LayoutItemNode],
  dependencies: [configExtension(DOMImportExtension, { rules: [containerImportRule, itemImportRule] })],
  register: (editor) =>
    mergeRegister(
      editor.registerCommand(KEY_ARROW_DOWN_COMMAND, (event) => $onEscapeDown($isLayoutContainerNode, event), COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ARROW_RIGHT_COMMAND, (event) => $onEscapeDown($isLayoutContainerNode, event), COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ARROW_UP_COMMAND, (event) => $onEscapeUp($isLayoutContainerNode, event), COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ARROW_LEFT_COMMAND, (event) => $onEscapeUp($isLayoutContainerNode, event), COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        INSERT_LAYOUT_COMMAND,
        (template) => {
          editor.update(() => {
            const container = $createLayoutContainerNode(template);
            for (let i = 0; i < columnsOf(template); i++) container.append($createLayoutItemNode().append($createParagraphNode()));
            $insertNodeToNearestRoot(container);
            container.selectStart();
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        UPDATE_LAYOUT_COMMAND,
        ({ template, nodeKey }) => {
          editor.update(() => {
            const container = $getNodeByKey(nodeKey);
            if (!$isLayoutContainerNode(container)) return;
            const next = columnsOf(template);
            const previous = columnsOf(container.getTemplateColumns());
            if (next > previous) {
              for (let i = previous; i < next; i++) container.append($createLayoutItemNode().append($createParagraphNode()));
            } else if (next < previous) {
              for (let i = previous - 1; i >= next; i--) {
                const item = container.getChildAtIndex(i);
                if ($isLayoutItemNode(item)) item.remove();
              }
            }
            container.setTemplateColumns(template);
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        REMOVE_LAYOUT_COMMAND,
        (nodeKey) => {
          editor.update(() => {
            const container = $getNodeByKey(nodeKey);
            if (!$isLayoutContainerNode(container)) return;
            for (const item of container.getChildren()) {
              if (!$isLayoutItemNode(item)) continue;
              for (const child of item.getChildren()) container.insertBefore(child);
            }
            container.remove();
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerNodeTransform(LayoutItemNode, (node) => {
        const parent = node.getParent();
        if (!$isLayoutContainerNode(parent)) {
          for (const child of node.getChildren()) node.insertBefore(child);
          node.remove();
          return;
        }
        if (node.isEmpty()) node.append($createParagraphNode());
      }),
      editor.registerNodeTransform(LayoutContainerNode, (node) => {
        const children = node.getChildren();
        if (!children.every($isLayoutItemNode)) {
          for (const child of children) node.insertBefore(child);
          node.remove();
        }
      }),
    ),
});

export function $getLayout() {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  const container = $findMatchingParent(selection.anchor.getNode(), $isLayoutContainerNode);
  return container ? { nodeKey: container.getKey(), template: container.getTemplateColumns() } : null;
}

export function useLayout() {
  const editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output);
  return editorState.read(() => $getLayout());
}
