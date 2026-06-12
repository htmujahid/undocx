"use client"

import { useState } from "react"

import {
  ChevronsUpDownIcon,
  FileTextIcon,
  PlusIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { ArtifactSummary } from "@/lib/data/artifacts"
import { cn } from "@/lib/utils"

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

type SortBy = "updated" | "created" | "name"

const SORT_LABELS: Record<SortBy, string> = {
  updated: "Last updated",
  created: "Date created",
  name: "Name",
}

export type ArtifactAction =
  | {
      type: "action"
      label: string
      onClick: () => void
      destructive?: boolean
    }
  | { type: "separator" }

export function ArtifactListView({
  workspaceId,
  artifacts,
  isLoading,
  headerLabel,
  headerIcon,
  emptyTitle = "No artifacts",
  emptyDescription,
  emptyAction,
  getActions,
}: {
  workspaceId: string
  artifacts: ArtifactSummary[]
  isLoading: boolean
  headerLabel: string
  headerIcon?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  getActions: (artifact: ArtifactSummary) => ArtifactAction[]
}) {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<SortBy>("updated")

  const sorted = [...artifacts].sort((a, b) => {
    if (sortBy === "name") return (a.title || "").localeCompare(b.title || "")
    if (sortBy === "created")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b px-3">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger />
          {headerIcon}
          <span className="truncate text-xs text-muted-foreground">
            {headerLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-7 items-center gap-1 rounded px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground">
              {SORT_LABELS[sortBy]}
              <ChevronsUpDownIcon className="size-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {(Object.entries(SORT_LABELS) as [SortBy, string][]).map(
                ([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    className={cn(sortBy === key && "font-medium")}
                    onClick={() => setSortBy(key)}
                  >
                    {label}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-border" />

          <Button
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => router.push(`/workspace/${workspaceId}/new`)}
          >
            <PlusIcon className="size-3.5" />
            New artifact
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-3xl">
          {isLoading ? (
            <div className="overflow-hidden rounded-lg border">
              {Array.from({ length: 8 }).map((_, i) => (
                <ListSkeletonRow key={i} last={i === 7} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              action={emptyAction}
            />
          ) : (
            <div className="overflow-hidden rounded-lg border">
              {sorted.map((art, i) => (
                <ArtifactListRow
                  key={art.id}
                  artifact={art}
                  onClick={() =>
                    router.push(`/workspace/${workspaceId}/${art.id}`)
                  }
                  actions={getActions(art)}
                  last={i === sorted.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Shared action menu ────────────────────────────────────────────────────────

function ActionMenu({ actions }: { actions: ArtifactAction[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs leading-none">···</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {actions.map((action, i) =>
          action.type === "separator" ? (
            <DropdownMenuSeparator key={i} />
          ) : (
            <DropdownMenuItem
              key={action.label}
              className={cn(
                action.destructive && "text-destructive focus:text-destructive"
              )}
              onClick={(e) => {
                e.stopPropagation()
                action.onClick()
              }}
            >
              {action.label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── List row ──────────────────────────────────────────────────────────────────

function ArtifactListRow({
  artifact,
  onClick,
  actions,
  last,
}: {
  artifact: ArtifactSummary
  onClick: () => void
  actions: ArtifactAction[]
  last: boolean
}) {
  return (
    <div
      className={cn(
        "group flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50",
        !last && "border-b"
      )}
      onClick={onClick}
    >
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <FileTextIcon className="size-3.5 text-muted-foreground" />
      </div>

      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {artifact.title || "Untitled"}
      </span>

      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {relativeTime(artifact.updatedAt)}
      </span>

      {actions.length > 0 && (
        <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
          <ActionMenu actions={actions} />
        </div>
      )}
    </div>
  )
}

// ── Skeleton states ───────────────────────────────────────────────────────────

function ListSkeletonRow({ last }: { last: boolean }) {
  return (
    <div
      className={cn("flex items-center gap-3 px-4 py-2.5", !last && "border-b")}
    >
      <div className="size-7 animate-pulse rounded-md bg-muted" />
      <div className="h-3.5 flex-1 animate-pulse rounded bg-muted" />
      <div className="h-3 w-14 animate-pulse rounded bg-muted" />
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <FileTextIcon className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
