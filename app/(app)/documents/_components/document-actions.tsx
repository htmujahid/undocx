"use client";

import { useState } from "react";
import { CheckIcon, DotsThreeIcon, PencilSimpleIcon, TrashIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
import { type DocumentStatus } from "~@/lib/documents/schemas";
import { useSetDocumentStatus } from "../query";
import { RenameDialog } from "./rename-document-dialog";
import { DeleteDocumentDialog } from "./delete-document-dialog";

export function DocumentActions({ id, title, status }: { id: string; title: string; status: DocumentStatus | "drafting" }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { trigger: setStatus } = useSetDocumentStatus(id);
  const next: DocumentStatus = status === "ready" ? "draft" : "ready";
  const isDrafting = status === "drafting";
  return (
    <>
      <Menu
        onAction={(action) => {
          if (action === "rename") setIsRenaming(true);
          if (action === "status") void setStatus(next);
          if (action === "delete") setIsDeleting(true);
        }}
      >
        <MenuTrigger aria-label={`Actions for ${title}`} className="relative z-10 flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted">
          <DotsThreeIcon className="size-4" />
        </MenuTrigger>
        <MenuContent align="end" className="min-w-48">
          <MenuItem value="rename" icon={<PencilSimpleIcon />}>
            Rename
          </MenuItem>
          {isDrafting ? null : (
            <MenuItem value="status" icon={<CheckIcon />}>
              {status === "ready" ? "Back to draft" : "Mark ready to send"}
            </MenuItem>
          )}
          <MenuSeparator />
          <MenuItem value="delete" icon={<TrashIcon />} destructive>
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>
      <RenameDialog id={id} title={title} open={isRenaming} onOpenChange={setIsRenaming} />
      <DeleteDocumentDialog id={id} open={isDeleting} onOpenChange={setIsDeleting} />
    </>
  );
}
