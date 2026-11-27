"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useShortcut } from "@ui-sdk/react/shortcuts";
import { REDO_COMMAND, UNDO_COMMAND } from "lexical";

function isOutsideEditableControl() {
  const element = document.activeElement;
  return !(element instanceof HTMLElement && (element.isContentEditable || element.matches("input, textarea, select")));
}

export function HistoryShortcuts() {
  const [editor] = useLexicalComposerContext();
  const undo = () => editor.dispatchCommand(UNDO_COMMAND, undefined);
  const redo = () => editor.dispatchCommand(REDO_COMMAND, undefined);
  useShortcut("mod+z", undo, { description: "Undo", when: isOutsideEditableControl });
  useShortcut("mod+shift+z", redo, { description: "Redo", when: isOutsideEditableControl });
  useShortcut("mod+y", redo, { description: "Redo", when: isOutsideEditableControl });
  return null;
}
