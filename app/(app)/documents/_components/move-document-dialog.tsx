"use client";

import { useState } from "react";
import { Button, buttonVariants } from "~@/components/ui/button";
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "~@/components/ui/dialog";
import { LoaderCircleIcon } from "~@/components/ui/icons";
import { OptionSelect } from "~@/components/ui/option-select";
import { useMoveDocument } from "../query";

export function MoveDocumentDialog({ id, folderId, folders, onClose }: { id: string; folderId: string | null; folders: { id: string; name: string }[]; onClose: () => void }) {
  const { trigger } = useMoveDocument(id);
  const [value, setValue] = useState(folderId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setIsSaving(true);
    const result = await trigger(value);
    setIsSaving(false);
    if (result?.error) setError(result.error);
    else onClose();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogContent className="w-[min(26rem,calc(100vw-2rem))]">
        <div className="grid gap-4 p-5">
          <div className="grid gap-2">
            <DialogTitle>Move to a folder</DialogTitle>
            <DialogDescription>{folders.length === 0 ? "Create a folder from the Folders list first." : "Pick where this document lives."}</DialogDescription>
          </div>
          <OptionSelect label="Folder" value={value} options={folders.map((folder) => ({ value: folder.id, label: folder.name }))} onChange={setValue} notSetLabel="No folder" />
          {error ? (
            <p className="m-0 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <DialogClose className={buttonVariants({ variant: "ghost" })}>Cancel</DialogClose>
          <Button variant="primary" disabled={isSaving || value === folderId} onClick={() => void save()}>
            {isSaving ? <LoaderCircleIcon className="animate-spin" /> : null}
            Move
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
