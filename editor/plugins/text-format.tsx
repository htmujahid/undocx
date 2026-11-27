"use client";

import { EditorStateExtension } from "@lexical/extension";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, type TextFormatType } from "lexical";
import type { ComponentType } from "react";
import { BoldIcon, CodeIcon, ItalicIcon, StrikethroughIcon } from "~@/components/ui/icons";
import { Toggle, ToggleGroup } from "~@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "~@/components/ui/tooltip";

export const textFormats: { value: TextFormatType; label: string; shortcut?: string; Icon: ComponentType<{ className?: string }> }[] = [
  { value: "bold", label: "Bold", shortcut: "⌘B", Icon: BoldIcon },
  { value: "italic", label: "Italic", shortcut: "⌘I", Icon: ItalicIcon },
  { value: "strikethrough", label: "Strikethrough", Icon: StrikethroughIcon },
  { value: "code", label: "Inline code", Icon: CodeIcon },
];

export function $getTextFormats(): TextFormatType[] {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return [];
  return textFormats.filter(({ value }) => selection.hasFormat(value)).map(({ value }) => value);
}

export function useTextFormats() {
  const editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output);
  return editorState.read(() => $getTextFormats());
}

const toggleClass = "size-8 justify-center border-0 bg-transparent px-0 data-pressed:bg-primary/10";

export function TextFormatToggles() {
  const [editor] = useLexicalComposerContext();
  const active = useTextFormats();
  return (
    <ToggleGroup
      multiple
      aria-label="Text formatting"
      value={active}
      onValueChange={(next) => {
        const changed = textFormats.find(({ value }) => next.includes(value) !== active.includes(value));
        if (changed) editor.dispatchCommand(FORMAT_TEXT_COMMAND, changed.value);
      }}
    >
      {textFormats.map(({ value, label, shortcut, Icon }) => (
        <Tooltip key={value}>
          <TooltipTrigger render={<Toggle value={value} aria-label={label} className={toggleClass} />}>
            <Icon />
          </TooltipTrigger>
          <TooltipContent>{shortcut ? `${label} ${shortcut}` : label}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  );
}
