"use client"

import { useState } from "react"

import { PlusIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { artifactsQueryOptions } from "@/lib/data/artifacts"
import {
  createFolderMutationOptions,
  foldersQueryOptions,
} from "@/lib/data/folders"

import { FolderTree } from "./folder-tree"

interface FolderSectionProps {
  workspaceId: string
}

export function FolderSection({ workspaceId }: FolderSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedFolderId = searchParams.get("folderId")

  const qc = useQueryClient()
  const { data: folders = [], isLoading } = useQuery(
    foldersQueryOptions(workspaceId)
  )
  const { data: artifacts = [] } = useQuery(artifactsQueryOptions(workspaceId))

  const invalidateFolders = () =>
    qc.invalidateQueries({
      queryKey: foldersQueryOptions(workspaceId).queryKey,
    })

  const createFolderMutation = useMutation({
    ...createFolderMutationOptions,
    onSuccess: invalidateFolders,
  })

  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set())
  const [createParentId, setCreateParentId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState("")

  const toggleOpen = (id: string) =>
    setOpenFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
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

  const topLevel = folders.filter((f) => f.parentId === null)

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Folders</SidebarGroupLabel>
        <SidebarGroupAction
          title="New folder"
          onClick={() => openCreateDialog(null)}
        >
          <PlusIcon />
          <span className="sr-only">New folder</span>
        </SidebarGroupAction>
        <FolderTree
          folders={folders}
          artifacts={artifacts}
          topLevel={topLevel}
          isLoading={isLoading}
          openFolders={openFolders}
          selectedFolderId={selectedFolderId}
          workspaceId={workspaceId}
          onToggle={toggleOpen}
          onSelect={(folderId) => {
            if (folderId) {
              router.push(
                `/workspace/${workspaceId}/folders?folderId=${folderId}`
              )
            } else {
              router.push(`/workspace/${workspaceId}`)
            }
          }}
          onCreateSubfolder={openCreateDialog}
        />
      </SidebarGroup>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) setCreateName("")
          setCreateOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {createParentId ? "New subfolder" : "New folder"}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
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
    </>
  )
}
