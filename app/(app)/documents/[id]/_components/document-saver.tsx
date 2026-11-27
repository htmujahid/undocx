"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_EDITOR } from "lexical";
import { useEffect, useRef } from "react";
import { DOCUMENT_RESTORED_COMMAND } from "~@/editor/extensions/versions";
import { useSaveDocument } from "../query";

export type SaveState = { kind: "saved" } | { kind: "unsaved" } | { kind: "saving" } | { kind: "error"; message: string };

const DELAY = 1500;

export function DocumentSaver({ id, version, onState }: { id: string; version: number; onState: (state: SaveState) => void }) {
  const [editor] = useLexicalComposerContext();
  const { trigger } = useSaveDocument(id);
  const versionRef = useRef(version);
  const savedRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const isBlockedRef = useRef(false);
  const triggerRef = useRef(trigger);
  const onStateRef = useRef(onState);

  useEffect(() => {
    triggerRef.current = trigger;
    onStateRef.current = onState;
  });

  useEffect(() => {
    const serialize = () => JSON.stringify(editor.getEditorState().toJSON());
    savedRef.current = serialize();

    const clearTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    const flush = async () => {
      clearTimer();
      if (isSavingRef.current || isBlockedRef.current) return;
      const content = serialize();
      if (content === savedRef.current) {
        onStateRef.current({ kind: "saved" });
        return;
      }
      isSavingRef.current = true;
      onStateRef.current({ kind: "saving" });
      try {
        const result = await triggerRef.current({ content, version: versionRef.current });
        if ("version" in result) {
          versionRef.current = result.version;
          savedRef.current = content;
          if (serialize() === content) onStateRef.current({ kind: "saved" });
          else schedule();
        } else {
          if (result.isConflict) isBlockedRef.current = true;
          onStateRef.current({ kind: "error", message: result.error });
        }
      } catch {
        onStateRef.current({ kind: "error", message: "Could not save. Check your connection." });
      } finally {
        isSavingRef.current = false;
      }
    };

    function schedule() {
      clearTimer();
      onStateRef.current({ kind: "unsaved" });
      timerRef.current = setTimeout(() => void flush(), DELAY);
    }

    const unregister = editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
      if (serialize() === savedRef.current) return;
      schedule();
    });

    const unregisterRestore = editor.registerCommand(
      DOCUMENT_RESTORED_COMMAND,
      ({ version: next }) => {
        clearTimer();
        versionRef.current = next;
        savedRef.current = serialize();
        isBlockedRef.current = false;
        onStateRef.current({ kind: "saved" });
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    const onVisibility = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    const onUnload = (event: BeforeUnloadEvent) => {
      if (timerRef.current || isSavingRef.current) event.preventDefault();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onUnload);

    return () => {
      unregister();
      unregisterRestore();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onUnload);
      if (timerRef.current) void flush();
    };
  }, [editor]);

  return null;
}
