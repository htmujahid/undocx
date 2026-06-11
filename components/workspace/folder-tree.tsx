"use client"

import { PlusIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
import type { ArtifactSummary } from "@/lib/data/artifacts"
import type { Folder } from "@/lib/data/folders"
import { FolderItem } from "./folder-item"
import type { FolderCallbacks } from "./types"

interface FolderTreeProps {
  folders: Folder[]
  artifacts: ArtifactSummary[]
  topLevel: Folder[]
  openFolders: Set<string>
  selectedFolderId?: string | null
  workspaceId: string
  callbacks: FolderCallbacks
  onNewRootFolder: () => void
  isLoading?: boolean
}

export function FolderTree({
  folders,
  artifacts,
  topLevel,
  openFolders,
  selectedFolderId,
  workspaceId,
  callbacks,
  onNewRootFolder,
  isLoading,
}: FolderTreeProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Folders</SidebarGroupLabel>
      <SidebarGroupAction title="New folder" onClick={onNewRootFolder}>
        <PlusIcon />
        <span className="sr-only">New folder</span>
      </SidebarGroupAction>

      <SidebarMenu>
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuSkeleton showIcon className="h-7" />
            </SidebarMenuItem>
          ))}
        {!isLoading && topLevel.length === 0 && (
          <p className="px-2 py-1 text-xs text-muted-foreground">No folders yet</p>
        )}
        {topLevel.map((f) => (
          <FolderItem
            key={f.id}
            folder={f}
            allFolders={folders}
            allArtifacts={artifacts}
            openFolders={openFolders}
            selectedFolderId={selectedFolderId}
            workspaceId={workspaceId}
            callbacks={callbacks}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
