"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useSyncExternalStore } from "react";

const number = new Intl.NumberFormat("en-US");

export function WordCount() {
  const [editor] = useLexicalComposerContext();
  const read = () => editor.getEditorState().read(() => $getRoot().getTextContent());
  const text = useSyncExternalStore((onChange) => editor.registerTextContentListener(onChange), read, read);
  const words = text.match(/\S+/g)?.length ?? 0;
  const characters = text.replace(/\s/g, "").length;
  return (
    <span aria-live="polite">
      {number.format(words)} {words === 1 ? "word" : "words"} · {number.format(characters)} characters
    </span>
  );
}
