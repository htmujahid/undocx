"use client"

import { ChevronsUpDownIcon, PlusIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { SortBy } from "@/lib/data/artifacts"
import { cn } from "@/lib/utils"

const SORT_LABELS: Record<SortBy, string> = {
  updated: "Last updated",
  created: "Date created",
  name: "Name",
}

export function ArtifactListNavbar({
  workspaceId,
  label,
  icon,
}: {
  workspaceId: string
  label: string
  icon?: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sortBy = (searchParams.get("sort") as SortBy | null) ?? "updated"

  function setSort(sort: SortBy) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", sort)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b px-3">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />
        {icon}
        <span className="truncate text-xs text-muted-foreground">{label}</span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 items-center gap-1 rounded px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground">
            {SORT_LABELS[sortBy]}
            <ChevronsUpDownIcon className="size-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {(Object.entries(SORT_LABELS) as [SortBy, string][]).map(
              ([key, lbl]) => (
                <DropdownMenuItem
                  key={key}
                  className={cn(sortBy === key && "font-medium")}
                  onClick={() => setSort(key)}
                >
                  {lbl}
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
  )
}
