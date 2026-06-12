"use client"

import { FileTextIcon, FolderIcon, PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { ArtifactSummary } from "@/lib/data/artifacts"
import type { Collection } from "@/lib/data/collections"
import type { Folder } from "@/lib/data/folders"

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export type ArtifactAction =
  | { type: "action"; label: string; onClick: () => void; destructive?: boolean }
  | { type: "separator" }

interface ArtifactListViewProps {
  workspaceId: string
  artifacts: ArtifactSummary[]
  folders: Folder[]
  collections: Collection[]
  isLoading: boolean
  headerLabel: string
  headerIcon?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  getActions: (artifact: ArtifactSummary) => ArtifactAction[]
}

export function ArtifactListView({
  workspaceId,
  artifacts,
  folders,
  collections,
  isLoading,
  headerLabel,
  headerIcon,
  emptyTitle = "No artifacts",
  emptyDescription,
  getActions,
}: ArtifactListViewProps) {
  const router = useRouter()

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="flex h-11 shrink-0 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          {headerIcon}
          <span className="text-xs text-muted-foreground">{headerLabel}</span>
        </div>
        <Button
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => router.push(`/workspace/${workspaceId}/new`)}
        >
          <PlusIcon className="size-3.5" />
          New artifact
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : artifacts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileTextIcon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{emptyTitle}</p>
              {emptyDescription && (
                <p className="mt-1 text-xs text-muted-foreground">{emptyDescription}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {artifacts.map((art) => (
              <SimpleArtifactCard
                key={art.id}
                artifact={art}
                folders={folders}
                collections={collections}
                onClick={() => router.push(`/workspace/${workspaceId}/${art.id}`)}
                actions={getActions(art)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SimpleArtifactCard({
  artifact,
  folders,
  collections,
  onClick,
  actions,
}: {
  artifact: ArtifactSummary
  folders: Folder[]
  collections: Collection[]
  onClick: () => void
  actions: ArtifactAction[]
}) {
  const artifactFolders = artifact.folderIds
    .map((id) => folders.find((f) => f.id === id))
    .filter((f): f is Folder => !!f)

  const artifactCollections = artifact.collectionIds
    .map((id) => collections.find((c) => c.id === id))
    .filter((c): c is Collection => !!c)

  const realActions = actions as (Extract<ArtifactAction, { type: "action" }> | Extract<ArtifactAction, { type: "separator" }>)[]

  return (
    <div className="group flex flex-col rounded-lg border bg-card transition-colors hover:bg-accent hover:text-accent-foreground">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />
        {actions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="invisible flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground group-hover:visible data-[state=open]:visible">
              <span className="text-xs leading-none">···</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {realActions.map((action, i) =>
                action.type === "separator" ? (
                  <DropdownMenuSeparator key={i} />
                ) : (
                  <DropdownMenuItem
                    key={action.label}
                    className={action.destructive ? "text-destructive focus:text-destructive" : ""}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <button onClick={onClick} className="min-w-0 px-4 pb-4 text-left">
        <p className="truncate text-sm font-medium leading-snug">
          {artifact.title || "Untitled"}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">{relativeTime(artifact.updatedAt)}</p>
        {artifactFolders.length > 0 && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <FolderIcon className="size-2.5 shrink-0" />
            <span className="truncate">{artifactFolders.map((f) => f.name).join(", ")}</span>
          </p>
        )}
        {artifactCollections.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {artifactCollections.map((col) => (
              <span
                key={col.id}
                className="flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <span className="max-w-20 truncate">{col.name}</span>
              </span>
            ))}
          </div>
        )}
      </button>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="size-5 animate-pulse rounded bg-muted" />
      <div className="space-y-1.5">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
