"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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
  artifactsQueryOptions,
  createArtifactMutationOptions,
} from "@/lib/data/artifacts"
import {
  type Folder,
  createFolderMutationOptions,
  deleteFolderMutationOptions,
  foldersQueryOptions,
  updateFolderMutationOptions,
} from "@/lib/data/folders"
import { FolderTree } from "./folder-tree"
import type { FolderCallbacks } from "./types"

interface FolderSectionProps {
  workspaceId: string
  selectedFolderId?: string | null
  onFolderSelect?: (folderId: string | null) => void
}

export function FolderSection({
  workspaceId,
  selectedFolderId,
  onFolderSelect,
}: FolderSectionProps) {
  const router = useRouter()
  const qc = useQueryClient()
  const { data: folders = [], isLoading } = useQuery(foldersQueryOptions(workspaceId))
  const { data: artifacts = [] } = useQuery(artifactsQueryOptions(workspaceId))

  const invalidateFolders = () =>
    qc.invalidateQueries({ queryKey: foldersQueryOptions(workspaceId).queryKey })

  const createFolderMutation = useMutation({
    ...createFolderMutationOptions,
    onSuccess: invalidateFolders,
  })
  const updateFolderMutation = useMutation({
    ...updateFolderMutationOptions,
    onSuccess: invalidateFolders,
  })
  const deleteFolderMutation = useMutation({
    ...deleteFolderMutationOptions,
    onSuccess: invalidateFolders,
  })
  const createArtifactMutation = useMutation({
    ...createArtifactMutationOptions,
    onSuccess: (artifact) => {
      qc.invalidateQueries({ queryKey: artifactsQueryOptions(workspaceId).queryKey })
      router.push(`/workspace/${workspaceId}/${artifact.id}`)
    },
  })

  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set())
  const [createParentId, setCreateParentId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState("")
  const [editTarget, setEditTarget] = useState<Folder | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Folder | null>(null)

  const toggleOpen = (id: string) =>
    setOpenFolders((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const openCreateDialog = (parentId: string | null = null) => {
    setCreateParentId(parentId)
    setCreateName("")
    setCreateOpen(true)
  }

  const handleCreateFolder = () => {
    if (!createName.trim() || createFolderMutation.isPending) return
    createFolderMutation.mutate(
      { workspaceId, name: createName.trim(), parentId: createParentId },
      {
        onSuccess: () => {
          setCreateName("")
          setCreateOpen(false)
          if (createParentId) {
            setOpenFolders((prev) => new Set([...prev, createParentId!]))
          }
        },
      }
    )
  }

  const handleUpdateFolder = () => {
    if (!editTarget || !editName.trim() || updateFolderMutation.isPending) return
    updateFolderMutation.mutate(
      { workspaceId, id: editTarget.id, name: editName.trim() },
      { onSuccess: () => setEditTarget(null) }
    )
  }

  const callbacks: FolderCallbacks = {
    onToggle: toggleOpen,
    onSelect: onFolderSelect,
    onCreateSubfolder: openCreateDialog,
    onCreateArtifact: (folderId) => {
      if (createArtifactMutation.isPending) return
      createArtifactMutation.mutate({ workspaceId, title: "Untitled", folderIds: [folderId] })
    },
    onEdit: (f) => {
      setEditTarget(f)
      setEditName(f.name)
    },
    onDelete: setDeleteTarget,
  }

  const topLevel = folders.filter((f) => f.parentId === null)

  return (
    <>
      <FolderTree
        folders={folders}
        artifacts={artifacts}
        topLevel={topLevel}
        isLoading={isLoading}
        openFolders={openFolders}
        selectedFolderId={selectedFolderId}
        workspaceId={workspaceId}
        callbacks={callbacks}
        onNewRootFolder={() => openCreateDialog(null)}
      />

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) setCreateName("")
          setCreateOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{createParentId ? "New subfolder" : "New folder"}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateFolder}
              disabled={!createName.trim() || createFolderMutation.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
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
            <Button variant="outline" size="sm" onClick={() => setEditTarget(null)}>
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
              &ldquo;{deleteTarget?.name}&rdquo; will be permanently deleted. Sub-folders will be
              unlinked but not deleted.
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
