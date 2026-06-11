"use client"

import { useState } from "react"

import { ChevronRightIcon, EditIcon, FileTextIcon, MoreHorizontalIcon, PlusIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { artifactsQueryOptions } from "@/lib/data/artifacts"
import {
  type Collection,
  collectionsQueryOptions,
  createCollectionMutationOptions,
  deleteCollectionMutationOptions,
  updateCollectionMutationOptions,
} from "@/lib/data/collections"
import { cn } from "@/lib/utils"
import { COLLECTION_COLORS, ColorPicker } from "./color-picker"

interface CollectionSectionProps {
  workspaceId: string
  selectedCollectionId?: string | null
  onCollectionSelect?: (id: string | null) => void
}

export function CollectionSection({
  workspaceId,
  selectedCollectionId,
  onCollectionSelect,
}: CollectionSectionProps) {
  const { isMobile } = useSidebar()
  const qc = useQueryClient()
  const { data: collections = [], isLoading } = useQuery(collectionsQueryOptions(workspaceId))
  const { data: artifacts = [] } = useQuery(artifactsQueryOptions(workspaceId))

  const [openCollections, setOpenCollections] = useState<Set<string>>(new Set())

  const toggleOpen = (id: string) =>
    setOpenCollections((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: collectionsQueryOptions(workspaceId).queryKey })

  const createMutation = useMutation({
    ...createCollectionMutationOptions,
    onSuccess: invalidate,
  })
  const updateMutation = useMutation({
    ...updateCollectionMutationOptions,
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    ...deleteCollectionMutationOptions,
    onSuccess: invalidate,
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createColor, setCreateColor] = useState(COLLECTION_COLORS[0])
  const [editTarget, setEditTarget] = useState<Collection | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState(COLLECTION_COLORS[0])
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null)

  const handleCreate = () => {
    if (!createName.trim() || createMutation.isPending) return
    createMutation.mutate(
      { workspaceId, name: createName.trim(), color: createColor },
      {
        onSuccess: () => {
          setCreateName("")
          setCreateColor(COLLECTION_COLORS[0])
          setCreateOpen(false)
        },
      }
    )
  }

  const handleUpdate = () => {
    if (!editTarget || !editName.trim() || updateMutation.isPending) return
    updateMutation.mutate(
      { workspaceId, id: editTarget.id, name: editName.trim(), color: editColor },
      { onSuccess: () => setEditTarget(null) }
    )
  }

  const startEdit = (col: Collection) => {
    setEditTarget(col)
    setEditName(col.name)
    setEditColor(col.color)
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Collections</SidebarGroupLabel>
        <SidebarGroupAction title="New collection" onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          <span className="sr-only">New collection</span>
        </SidebarGroupAction>

        <SidebarMenu>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuSkeleton showIcon className="h-7" />
              </SidebarMenuItem>
            ))}
          {!isLoading && collections.length === 0 && (
            <p className="px-2 py-1 text-xs text-muted-foreground">No collections yet</p>
          )}
          {collections.map((col) => {
            const colArtifacts = artifacts.filter((a) => a.collectionIds.includes(col.id))
            const isOpen = openCollections.has(col.id)
            const isSelected = selectedCollectionId === col.id

            return (
              <SidebarMenuItem key={col.id}>
                <SidebarMenuButton
                  size="sm"
                  isActive={isSelected}
                  onClick={() => {
                    toggleOpen(col.id)
                    onCollectionSelect?.(isSelected ? null : col.id)
                  }}
                >
                  {colArtifacts.length > 0 ? (
                    <ChevronRightIcon
                      className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-90")}
                    />
                  ) : (
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: col.color }}
                    />
                  )}
                  <span className="truncate">{col.name}</span>
                  {colArtifacts.length > 0 && (
                    <span
                      className="ml-auto size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: col.color }}
                    />
                  )}
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
                    <DropdownMenuItem onClick={() => startEdit(col)}>
                      <EditIcon className="text-muted-foreground" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteTarget(col)}
                    >
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {isOpen && colArtifacts.length > 0 && (
                  <ul className="ms-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-s border-sidebar-border py-0.5 ps-2.5 group-data-[collapsible=icon]:hidden">
                    {colArtifacts.map((artifact) => (
                      <SidebarMenuSubItem key={artifact.id}>
                        <SidebarMenuSubButton
                          size="sm"
                          render={<Link href={`/workspace/${workspaceId}/${artifact.id}`} />}
                        >
                          <FileTextIcon className="size-4 shrink-0" />
                          <span className="truncate">{artifact.title || "Untitled"}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </ul>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroup>

      {/* Create */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateName("")
            setCreateColor(COLLECTION_COLORS[0])
          }
          setCreateOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New collection</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Collection name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <ColorPicker value={createColor} onChange={setCreateColor} />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!createName.trim() || createMutation.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
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
          <ColorPicker value={editColor} onChange={setEditColor} />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditTarget(null)}>
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

      {/* Delete */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; will be permanently deleted. Artifacts in this
              collection will be unlinked but not deleted.
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
