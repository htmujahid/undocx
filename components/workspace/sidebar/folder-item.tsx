"use client"

import {
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react"
import Link from "next/link"

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { ArtifactSummary } from "@/lib/data/artifacts"
import type { Folder } from "@/lib/data/folders"
import { cn } from "@/lib/utils"

import { FolderActionMenu } from "./folder-action-menu"

export interface FolderCallbacks {
  onToggle: (id: string) => void
  onSelect?: (folderId: string | null) => void
  onCreateSubfolder: (parentId: string | null) => void
  onEdit: (folder: Folder) => void
  onDelete: (folder: Folder) => void
}

export function FolderItem({
  folder,
  allFolders,
  allArtifacts,
  openFolders,
  selectedFolderId,
  workspaceId,
  callbacks,
}: {
  folder: Folder
  allFolders: Folder[]
  allArtifacts: ArtifactSummary[]
  openFolders: Set<string>
  selectedFolderId?: string | null
  workspaceId: string
  callbacks: FolderCallbacks
}) {
  const isOpen = openFolders.has(folder.id)
  const isSelected = selectedFolderId === folder.id
  const children = allFolders.filter((f) => f.parentId === folder.id)
  const artifacts = allArtifacts.filter((a) => a.folderIds.includes(folder.id))
  const hasContent = children.length > 0 || artifacts.length > 0

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="sm"
        isActive={isSelected}
        onClick={() => callbacks.onToggle(folder.id)}
      >
        <span className="relative size-4 shrink-0">
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity",
              hasContent && "group-hover/menu-button:opacity-0"
            )}
          >
            {isOpen ? (
              <FolderOpenIcon className="size-4" />
            ) : (
              <FolderIcon className="size-4" />
            )}
          </span>
          {hasContent && (
            <ChevronRightIcon
              className={cn(
                "absolute inset-0 size-4 opacity-0 transition-[opacity,transform] group-hover/menu-button:opacity-100",
                isOpen && "rotate-90"
              )}
            />
          )}
        </span>
        <span className="truncate">{folder.name}</span>
      </SidebarMenuButton>

      <FolderActionMenu folder={folder} callbacks={callbacks} />

      {isOpen && hasContent && (
        <ul className="ms-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-s border-sidebar-border ps-2.5 py-0.5 group-data-[collapsible=icon]:hidden">
          {children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              allFolders={allFolders}
              allArtifacts={allArtifacts}
              openFolders={openFolders}
              selectedFolderId={selectedFolderId}
              workspaceId={workspaceId}
              callbacks={callbacks}
            />
          ))}
          {artifacts.map((artifact) => (
            <SidebarMenuSubItem key={artifact.id}>
              <SidebarMenuSubButton
                size="sm"
                render={
                  <Link href={`/workspace/${workspaceId}/${artifact.id}`} />
                }
              >
                <FileTextIcon className="size-4 shrink-0" />
                <span className="truncate">{artifact.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </ul>
      )}
    </SidebarMenuItem>
  )
}
