"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState } from "react";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { DOCUMENT_RESTORED_COMMAND } from "~@/editor/extensions/versions";
import { useRestoreVersion, type VersionSummary } from "../versions/query";

export function VersionRestoreDialog({ documentId, version, onClose }: { documentId: string; version: VersionSummary; onClose: () => void }) {
  const [editor] = useLexicalComposerContext();
  const { trigger } = useRestoreVersion(documentId);
  const [isRestoring, setIsRestoring] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function restore() {
    setIsRestoring(true);
    setProblem(null);
    try {
      const result = await trigger({ id: version.id, current: JSON.stringify(editor.getEditorState().toJSON()) });
      if (!result || "error" in result) {
        setProblem(result?.error ?? "The version could not be restored.");
        return;
      }
      editor.setEditorState(editor.parseEditorState(result.content));
      editor.dispatchCommand(DOCUMENT_RESTORED_COMMAND, { version: result.version });
      onClose();
    } catch {
      setProblem("The version could not be restored. Try again.");
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <div className="grid gap-2 p-5">
          <DialogTitle>Restore version {version.number}?</DialogTitle>
          <DialogDescription>The document goes back to how it was then. Your current text is saved as a new version first, so nothing is lost.</DialogDescription>
          {problem ? (
            <p className="m-0 text-sm text-destructive" role="alert">
              {problem}
            </p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <DialogClose className={buttonVariants({ variant: "ghost" })}>Cancel</DialogClose>
          <Button variant="primary" disabled={isRestoring} onClick={() => void restore()}>
            {isRestoring ? <LoaderCircleIcon className="animate-spin" /> : null}
            Restore
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
