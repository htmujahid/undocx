"use client"

import { useState } from "react"

import {
  ChevronRightIcon,
  EditIcon,
  FileTextIcon,
  LayoutListIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { ArtifactSummary } from "@/lib/data/artifacts"
import {
  type Collection,
  collectionsQueryOptions,
  deleteCollectionMutationOptions,
  updateCollectionMutationOptions,
} from "@/lib/data/collections"
import { cn } from "@/lib/utils"

import {
  COLLECTION_COLORS,
  CollectionColorPicker,
} from "./collection-color-picker"

export function CollectionItem({
  collection,
  artifacts,
  workspaceId,
  isOpen,
  isSelected,
  onToggle,
  onSelect,
}: {
  collection: Collection
  artifacts: ArtifactSummary[]
  workspaceId: string
  isOpen: boolean
  isSelected: boolean
  onToggle: () => void
  onSelect: () => void
}) {
  const { isMobile } = useSidebar()
  const qc = useQueryClient()

  const invalidate = () =>
    qc.invalidateQueries({
      queryKey: collectionsQueryOptions(workspaceId).queryKey,
    })

  const updateMutation = useMutation({
    ...updateCollectionMutationOptions,
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    ...deleteCollectionMutationOptions,
    onSuccess: invalidate,
  })

  const [editTarget, setEditTarget] = useState<Collection | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState(COLLECTION_COLORS[0])
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null)

  const startEdit = (col: Collection) => {
    setEditTarget(col)
    setEditName(col.name)
    setEditColor(col.color)
  }

  const handleUpdate = () => {
    if (!editTarget || !editName.trim() || updateMutation.isPending) return
    updateMutation.mutate(
      {
        workspaceId,
        id: editTarget.id,
        name: editName.trim(),
        color: editColor,
      },
      { onSuccess: () => setEditTarget(null) }
    )
  }

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton size="sm" isActive={isSelected} onClick={onToggle}>
          {artifacts.length > 0 ? (
            <span className="relative size-4 shrink-0">
              <span className="absolute inset-0 flex items-center justify-center transition-opacity group-hover/menu-button:opacity-0">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: collection.color }}
                />
              </span>
              <ChevronRightIcon
                className={cn(
                  "absolute inset-0 size-4 opacity-0 transition-[opacity,transform] group-hover/menu-button:opacity-100",
                  isOpen && "rotate-90"
                )}
              />
            </span>
          ) : (
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: collection.color }}
            />
          )}
          <span className="truncate">{collection.name}</span>
        </SidebarMenuButton>

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
            <DropdownMenuItem onClick={onSelect}>
              <LayoutListIcon className="text-muted-foreground" />
              View collection
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => startEdit(collection)}>
              <EditIcon className="text-muted-foreground" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteTarget(collection)}
            >
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isOpen && artifacts.length > 0 && (
          <ul className="ms-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-s border-sidebar-border py-0.5 ps-2.5 group-data-[collapsible=icon]:hidden">
            {artifacts.map((artifact) => (
              <SidebarMenuSubItem key={artifact.id}>
                <SidebarMenuSubButton
                  size="sm"
                  render={
                    <Link href={`/workspace/${workspaceId}/${artifact.id}`} />
                  }
                >
                  <FileTextIcon className="size-4 shrink-0" />
                  <span className="truncate">
                    {artifact.title || "Untitled"}
                  </span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </ul>
        )}
      </SidebarMenuItem>

      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit collection</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Collection name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
            autoFocus
          />
          <CollectionColorPicker value={editColor} onChange={setEditColor} />
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
              onClick={handleUpdate}
              disabled={!editName.trim() || updateMutation.isPending}
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
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; will be permanently deleted.
              Artifacts in this collection will be unlinked but not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deleteTarget) return
                deleteMutation.mutate(
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
