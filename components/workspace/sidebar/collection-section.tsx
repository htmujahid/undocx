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
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
import { artifactsQueryOptions } from "@/lib/data/artifacts"
import {
  collectionsQueryOptions,
  createCollectionMutationOptions,
} from "@/lib/data/collections"

import {
  COLLECTION_COLORS,
  CollectionColorPicker,
} from "./collection-color-picker"
import { CollectionItem } from "./collection-item"

export function CollectionSection({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCollectionId = searchParams.get("collectionId")
  const qc = useQueryClient()
  const { data: collections = [], isLoading } = useQuery(
    collectionsQueryOptions(workspaceId)
  )
  const { data: artifacts = [] } = useQuery(artifactsQueryOptions(workspaceId))

  const [openCollections, setOpenCollections] = useState<Set<string>>(new Set())

  const toggleOpen = (id: string) =>
    setOpenCollections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const invalidate = () =>
    qc.invalidateQueries({
      queryKey: collectionsQueryOptions(workspaceId).queryKey,
    })

  const createMutation = useMutation({
    ...createCollectionMutationOptions,
    onSuccess: invalidate,
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createColor, setCreateColor] = useState(COLLECTION_COLORS[0])

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

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Collections</SidebarGroupLabel>
        <SidebarGroupAction
          title="New collection"
          onClick={() => setCreateOpen(true)}
        >
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
            <p className="px-2 py-1 text-xs text-muted-foreground">
              No collections yet
            </p>
          )}
          {collections.map((col) => (
            <CollectionItem
              key={col.id}
              collection={col}
              artifacts={artifacts.filter((a) =>
                a.collectionIds.includes(col.id)
              )}
              workspaceId={workspaceId}
              isOpen={openCollections.has(col.id)}
              isSelected={selectedCollectionId === col.id}
              onToggle={() => toggleOpen(col.id)}
              onSelect={() =>
                router.push(
                  `/workspace/${workspaceId}/collections?collectionId=${col.id}`
                )
              }
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>

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
          <CollectionColorPicker
            value={createColor}
            onChange={setCreateColor}
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
              onClick={handleCreate}
              disabled={!createName.trim() || createMutation.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
