"use client";

import Link from "next/link";
import { useState } from "react";
import { DotsThreeIcon, PencilSimpleIcon, TrashIcon } from "~@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~@/components/ui/menu";
import { cn } from "~@/lib/utils";
import { DeleteFolderDialog } from "./delete-folder-dialog";
import { FolderDialog } from "./folder-dialog";

export function FolderItem({ folder, href, isActive }: { folder: { id: string; name: string; documents: number }; href: string; isActive: boolean }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <li className={cn("group flex items-center rounded-md", isActive ? "bg-muted" : "hover:bg-muted/60")}>
      <Link href={href} aria-current={isActive ? "page" : undefined} className="flex min-w-0 flex-1 items-baseline justify-between gap-2 px-3 py-1.5 text-sm text-foreground no-underline">
        <span className="truncate">{folder.name}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{folder.documents}</span>
      </Link>
      <Menu
        onAction={(action) => {
          if (action === "rename") setIsRenaming(true);
          if (action === "delete") setIsDeleting(true);
        }}
      >
        <MenuTrigger aria-label={`Actions for folder ${folder.name}`} className="mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted">
          <DotsThreeIcon className="size-4" />
        </MenuTrigger>
        <MenuContent align="end" className="min-w-40">
          <MenuItem value="rename" icon={<PencilSimpleIcon />}>
            Rename
          </MenuItem>
          <MenuSeparator />
          <MenuItem value="delete" icon={<TrashIcon />} destructive>
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>
      <FolderDialog folder={folder} open={isRenaming} onOpenChange={setIsRenaming} />
      <DeleteFolderDialog id={folder.id} name={folder.name} open={isDeleting} onOpenChange={setIsDeleting} />
    </li>
  );
}
