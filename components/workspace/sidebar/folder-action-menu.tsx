"use client"

import {
  EditIcon,
  FolderPlusIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuAction, useSidebar } from "@/components/ui/sidebar"
import type { Folder } from "@/lib/data/folders"

import type { FolderCallbacks } from "./folder-item"

export function FolderActionMenu({
  folder,
  callbacks,
}: {
  folder: Folder
  callbacks: FolderCallbacks
}) {
  const { isMobile } = useSidebar()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuAction showOnHover />}>
        <MoreHorizontalIcon />
        <span className="sr-only">More</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
        className="w-48"
      >
        <DropdownMenuItem
          onClick={() => callbacks.onCreateSubfolder(folder.id)}
        >
          <FolderPlusIcon className="text-muted-foreground" />
          New subfolder
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => callbacks.onEdit(folder)}>
          <EditIcon className="text-muted-foreground" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => callbacks.onDelete(folder)}
        >
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
