"use client"

import { useState } from "react"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
import type { ArtifactSummary } from "@/lib/data/artifacts"
import {
  type Folder,
  deleteFolderMutationOptions,
  foldersQueryOptions,
  updateFolderMutationOptions,
} from "@/lib/data/folders"

import { FolderItem } from "./folder-item"
import type { FolderCallbacks } from "./folder-item"

export function FolderTree({
  folders,
  artifacts,
  topLevel,
  openFolders,
  selectedFolderId,
  workspaceId,
  isLoading,
  onToggle,
  onSelect,
  onCreateSubfolder,
}: {
  folders: Folder[]
  artifacts: ArtifactSummary[]
  topLevel: Folder[]
  openFolders: Set<string>
  selectedFolderId?: string | null
  workspaceId: string
  isLoading?: boolean
  onToggle: (id: string) => void
  onSelect: (folderId: string | null) => void
  onCreateSubfolder: (parentId: string | null) => void
}) {
  const qc = useQueryClient()

  const invalidateFolders = () =>
    qc.invalidateQueries({
      queryKey: foldersQueryOptions(workspaceId).queryKey,
    })

  const updateFolderMutation = useMutation({
    ...updateFolderMutationOptions,
    onSuccess: invalidateFolders,
  })
  const deleteFolderMutation = useMutation({
    ...deleteFolderMutationOptions,
    onSuccess: invalidateFolders,
  })

  const [editTarget, setEditTarget] = useState<Folder | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Folder | null>(null)

  const handleUpdateFolder = () => {
    if (!editTarget || !editName.trim() || updateFolderMutation.isPending)
      return
    updateFolderMutation.mutate(
      { workspaceId, id: editTarget.id, name: editName.trim() },
      { onSuccess: () => setEditTarget(null) }
    )
  }

  const callbacks: FolderCallbacks = {
    onToggle,
    onSelect,
    onCreateSubfolder,
    onEdit: (f) => {
      setEditTarget(f)
      setEditName(f.name)
    },
    onDelete: setDeleteTarget,
  }

  return (
    <>
      <SidebarMenu>
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuSkeleton showIcon className="h-7" />
            </SidebarMenuItem>
          ))}
        {!isLoading && topLevel.length === 0 && (
          <p className="px-2 py-1 text-xs text-muted-foreground">
            No folders yet
          </p>
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

      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdateFolder()}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateFolder}
              disabled={!editName.trim() || updateFolderMutation.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; will be permanently deleted.
              Sub-folders will be unlinked but not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteFolderMutation.isPending}
              onClick={() => {
                if (!deleteTarget) return
                deleteFolderMutation.mutate(
                  { workspaceId, id: deleteTarget.id },
                  { onSuccess: () => setDeleteTarget(null) }
                )
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
