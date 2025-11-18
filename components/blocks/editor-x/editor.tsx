"use client";

import { useCallback } from "react";

import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, SerializedEditorState } from "lexical";

import { useEditorContext } from "@/components/editor/context/editor-context";
import { useDebounce } from "@/components/editor/editor-hooks/use-debounce";
import { editorTheme } from "@/components/editor/themes/editor-theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Json } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

import { nodes } from "./nodes";
import { Plugins } from "./plugins";

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
};

export function Editor({
  documentId,
  editorSerializedState,
}: {
  documentId: string;
  editorSerializedState: SerializedEditorState;
}) {
  const supabase = createClient();
  const { setSaveStatus } = useEditorContext();

  const saveToDatabase = useCallback(
    async (content: SerializedEditorState) => {
      const { error } = await supabase
        .from("documents")
        .update({ content: content as unknown as Json })
        .eq("id", documentId);

      if (error) {
        console.error("Failed to save document:", error);
        setSaveStatus("idle");
      } else {
        setSaveStatus("saved");
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    },
    [supabase, documentId, setSaveStatus],
  );

  const debouncedSave = useDebounce(saveToDatabase, 3000);

  const handleEditorChange = useCallback(
    (editorState: EditorState) => {
      const serializedState = editorState.toJSON();
      setSaveStatus("saving");
      debouncedSave(serializedState);
    },
    [debouncedSave, setSaveStatus],
  );

  return (
    <div className="bg-background overflow-hidden [--footer-height:calc(--spacing(6))] [--header-height:calc(--spacing(22))]">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          editorState: JSON.stringify(editorSerializedState),
        }}
      >
        <TooltipProvider>
          <Plugins />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={handleEditorChange}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
