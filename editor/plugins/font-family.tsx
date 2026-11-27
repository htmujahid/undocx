"use client";

import { EditorStateExtension } from "@lexical/extension";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useExtensionDependency } from "@lexical/react/useExtensionComponent";
import { useSignalValue } from "@lexical/react/useExtensionSignalValue";
import { $isHeadingNode } from "@lexical/rich-text";
import { $getSelectionStyleValueForProperty, $patchStyleText } from "@lexical/selection";
import { $getSelection, $isRangeSelection, type LexicalEditor, type RangeSelection } from "lexical";
import { useState } from "react";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxField, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxTrigger } from "~@/components/ui/combobox";
import { ToolbarInput } from "~@/components/ui/toolbar";
import { cn } from "~@/lib/utils";
import { $findTopLevelElement } from "../selection";

export type FontFamily = "sans" | "serif" | "mono";

export const fontFamilies: { value: FontFamily; label: string; css: string; className: string }[] = [
  { value: "sans", label: "Sans", css: "var(--font-sans)", className: "font-sans" },
  { value: "serif", label: "Serif", css: "var(--font-serif)", className: "font-serif" },
  { value: "mono", label: "Mono", css: "var(--font-mono)", className: "font-mono" },
];

function $getDefaultFontFamily(selection: RangeSelection): FontFamily {
  return $isHeadingNode($findTopLevelElement(selection.anchor.getNode())) ? "serif" : "sans";
}

export function $getFontFamily(): FontFamily {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return "sans";
  const css = $getSelectionStyleValueForProperty(selection, "font-family", "");
  return fontFamilies.find((font) => font.css === css)?.value ?? $getDefaultFontFamily(selection);
}

export function useFontFamily() {
  const editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output);
  return editorState.read(() => $getFontFamily());
}

export function setFontFamily(editor: LexicalEditor, next: FontFamily) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const css = next === $getDefaultFontFamily(selection) ? null : (fontFamilies.find((font) => font.value === next)?.css ?? null);
    $patchStyleText(selection, { "font-family": css });
  });
}

export function FontFamilySelect() {
  const [editor] = useLexicalComposerContext();
  const font = useFontFamily();
  const [field, setField] = useState<HTMLDivElement | null>(null);
  return (
    <Combobox value={font} onValueChange={(next) => next && setFontFamily(editor, next as FontFamily)} autoHighlight="always">
      <ComboboxLabel className="sr-only">Font</ComboboxLabel>
      <ComboboxField ref={setField} className="w-28 shrink-0">
        <ToolbarInput render={<ComboboxInput placeholder="Font" className={cn("font-medium", fontFamilies.find((option) => option.value === font)?.className)} />} />
        <ComboboxTrigger aria-label="Show fonts" />
      </ComboboxField>
      <ComboboxContent anchor={field} className="w-40">
        <ComboboxEmpty>No font by that name.</ComboboxEmpty>
        <ComboboxList>
          {fontFamilies.map(({ value, label, className }) => (
            <ComboboxItem key={value} value={value} label={label} icon={<span className={cn("text-base leading-none", className)}>Aa</span>}>
              {label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
