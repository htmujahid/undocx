"use client"

import { formatDistanceToNow } from "date-fns"
import { FileTextIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ArtifactSummary } from "@/lib/data/artifacts"
import { cn } from "@/lib/utils"

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
  emptyTitle = "No artifacts",
  emptyDescription,
  emptyAction,
  getActions,
}: {
  workspaceId: string
  artifacts: ArtifactSummary[]
  isLoading: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  getActions: (artifact: ArtifactSummary) => ArtifactAction[]
}) {
  const router = useRouter()

  return (
    <div className="min-h-0 flex-1 overflow-auto p-4">
      <div className="mx-auto max-w-3xl h-full">
        {isLoading ? (
          <div className="overflow-hidden rounded-lg border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5",
                  i !== 7 && "border-b"
                )}
              >
                <div className="size-7 animate-pulse rounded-md bg-muted" />
                <div className="h-3.5 flex-1 animate-pulse rounded bg-muted" />
                <div className="h-3 w-14 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : artifacts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileTextIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{emptyTitle}</p>
              {emptyDescription && (
                <p className="text-xs text-muted-foreground">
                  {emptyDescription}
                </p>
              )}
            </div>
            {emptyAction}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            {artifacts.map((art, i) => {
              const actions = getActions(art)
              return (
                <div
                  key={art.id}
                  className={cn(
                    "group flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50",
                    i !== artifacts.length - 1 && "border-b"
                  )}
                  onClick={() =>
                    router.push(`/workspace/${workspaceId}/${art.id}`)
                  }
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <FileTextIcon className="size-3.5 text-muted-foreground" />
                  </div>

                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {art.title || "Untitled"}
                  </span>

                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatDistanceToNow(new Date(art.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>

                  {actions.length > 0 && (
                    <div
                      className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground">
                          <span className="text-xs leading-none">···</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {actions.map((action, j) =>
                            action.type === "separator" ? (
                              <DropdownMenuSeparator key={j} />
                            ) : (
                              <DropdownMenuItem
                                key={action.label}
                                className={cn(
                                  action.destructive &&
                                    "text-destructive focus:text-destructive"
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
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
