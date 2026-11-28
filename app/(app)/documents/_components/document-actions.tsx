"use client";

import { useState } from "react";
import { CheckIcon, DotsThreeIcon, FolderSimpleIcon, PencilSimpleIcon, TagIcon, TrashIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
import { type DocumentStatus } from "~@/lib/documents/schemas";
import { useSetDocumentStatus } from "../query";
import { RenameDialog } from "./rename-document-dialog";
import { DeleteDocumentDialog } from "./delete-document-dialog";
import { DocumentTagsDialog } from "./document-tags-dialog";
import { MoveDocumentDialog } from "./move-document-dialog";

export function DocumentActions({ id, title, status, folderId, folders, tags, allTags }: { id: string; title: string; status: DocumentStatus | "drafting"; folderId: string | null; folders: { id: string; name: string }[]; tags: string[]; allTags: string[] }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const { trigger: setStatus } = useSetDocumentStatus(id);
  const next: DocumentStatus = status === "ready" ? "draft" : "ready";
  const isDrafting = status === "drafting";
  return (
    <>
      <Menu
        onAction={(action) => {
          if (action === "rename") setIsRenaming(true);
          if (action === "move") setIsMoving(true);
          if (action === "tags") setIsTagging(true);
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
          <MenuItem value="move" icon={<FolderSimpleIcon />}>
            Move to folder
          </MenuItem>
          <MenuItem value="tags" icon={<TagIcon />}>
            Edit tags
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
      {isMoving ? <MoveDocumentDialog id={id} folderId={folderId} folders={folders} onClose={() => setIsMoving(false)} /> : null}
      {isTagging ? <DocumentTagsDialog id={id} title={title} current={tags} suggestions={allTags} onClose={() => setIsTagging(false)} /> : null}
    </>
  );
}
