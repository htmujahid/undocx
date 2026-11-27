"use client";

import { EditorStateExtension } from "@lexical/extension";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { $getSelection, $isElementNode, $isRangeSelection, FORMAT_ELEMENT_COMMAND, type ElementFormatType } from "lexical";
import type { ComponentType } from "react";
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from "~@/components/ui/icons";
import { Toggle, ToggleGroup } from "~@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";
import { $findTopLevelElement } from "../selection";

export type Alignment = "left" | "center" | "right" | "justify";

export const alignments: { value: Alignment; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { value: "left", label: "Align left", Icon: AlignLeftIcon },
  { value: "center", label: "Align centre", Icon: AlignCenterIcon },
  { value: "right", label: "Align right", Icon: AlignRightIcon },
  { value: "justify", label: "Justify", Icon: AlignJustifyIcon },
];

const known = new Set<string>(alignments.map((alignment) => alignment.value));

export function $getAlignment(): Alignment {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return "left";
  const element = $findTopLevelElement(selection.anchor.getNode());
  const format: ElementFormatType = $isElementNode(element) ? element.getFormatType() : "";
  return known.has(format) ? (format as Alignment) : "left";
}

export function useAlignment() {
  const editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output);
  return editorState.read(() => $getAlignment());
}

const toggleClass = "size-8 justify-center border-0 bg-transparent px-0 data-pressed:bg-primary/10";

export function AlignmentToggles() {
  const [editor] = useLexicalComposerContext();
  const alignment = useAlignment();
  return (
    <ToggleGroup aria-label="Alignment" value={[alignment]} onValueChange={(next) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, (next[0] as Alignment | undefined) ?? "left")}>
      {alignments.map(({ value, label, Icon }) => (
        <Tooltip key={value}>
          <TooltipTrigger render={<Toggle value={value} aria-label={label} className={toggleClass} />}>
            <Icon />
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  );
}
