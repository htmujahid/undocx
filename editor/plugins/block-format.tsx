"use client";

import { EditorStateExtension } from "@lexical/extension";
import { $isListNode, INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode, type HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getNearestNodeOfType } from "@lexical/utils";
import { $createParagraphNode, $getSelection, $isRangeSelection, type LexicalEditor } from "lexical";
import { useState, type ComponentType } from "react";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxField, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxTrigger, ComboboxValueIcon } from "~@/components/ui/combobox";
import { BulletListIcon, Heading1Icon, Heading2Icon, Heading3Icon, NumberedListIcon, ParagraphIcon, QuoteIcon, TaskListIcon } from "~@/components/ui/icons";
import { ToolbarInput } from "~@/components/ui/toolbar";
import { $findTopLevelElement } from "../selection";

export type BlockType = "paragraph" | "h1" | "h2" | "h3" | "number" | "bullet" | "check" | "quote";

export const blockTypes: { value: BlockType; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { value: "paragraph", label: "Paragraph", Icon: ParagraphIcon },
  { value: "h1", label: "Heading 1", Icon: Heading1Icon },
  { value: "h2", label: "Heading 2", Icon: Heading2Icon },
  { value: "h3", label: "Heading 3", Icon: Heading3Icon },
  { value: "number", label: "Numbered list", Icon: NumberedListIcon },
  { value: "bullet", label: "Bulleted list", Icon: BulletListIcon },
  { value: "check", label: "Task list", Icon: TaskListIcon },
  { value: "quote", label: "Quote", Icon: QuoteIcon },
];

const known = new Set<string>(blockTypes.map((block) => block.value));

export function $getBlockType(): BlockType | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  const anchorNode = selection.anchor.getNode();
  const element = $findTopLevelElement(anchorNode);
  if ($isListNode(element)) {
    const parentList = $getNearestNodeOfType(anchorNode, ListNode);
    return (parentList ?? element).getListType() as BlockType;
  }
  const type = $isHeadingNode(element) ? element.getTag() : element.getType();
  return known.has(type) ? (type as BlockType) : null;
}

export function useBlockType() {
  const editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output);
  return editorState.read(() => $getBlockType());
}

export function setBlockType(editor: LexicalEditor, current: BlockType | null, next: BlockType) {
  if (next === current) return;
  if (next === "number") return editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  if (next === "bullet") return editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  if (next === "check") return editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
  editor.update(() => {
    const selection = $getSelection();
    if (next === "quote") $setBlocksType(selection, () => $createQuoteNode());
    else if (next === "paragraph") $setBlocksType(selection, () => $createParagraphNode());
    else $setBlocksType(selection, () => $createHeadingNode(next as HeadingTagType));
  });
}

export function BlockFormatSelect() {
  const [editor] = useLexicalComposerContext();
  const blockType = useBlockType();
  const [field, setField] = useState<HTMLDivElement | null>(null);
  return (
    <Combobox value={blockType ?? "paragraph"} onValueChange={(next) => next && setBlockType(editor, blockType, next as BlockType)} autoHighlight="always">
      <ComboboxLabel className="sr-only">Block style</ComboboxLabel>
      <ComboboxField ref={setField} className="w-44 shrink-0">
        <ComboboxValueIcon />
        <ToolbarInput render={<ComboboxInput placeholder="Block style" className="font-medium" />} />
        <ComboboxTrigger aria-label="Show block styles" />
      </ComboboxField>
      <ComboboxContent anchor={field} className="w-48">
        <ComboboxEmpty>No style by that name.</ComboboxEmpty>
        <ComboboxList>
          {blockTypes.map(({ value, label, Icon }) => (
            <ComboboxItem key={value} value={value} label={label} icon={<Icon />}>
              {label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
