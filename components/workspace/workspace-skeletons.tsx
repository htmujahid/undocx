import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function ArtifactListPageSkeleton() {
  return (
    <div className="flex h-svh min-w-0 flex-1 flex-col overflow-hidden">
      {/* Navbar */}
      <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b px-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded" />
          <Skeleton className="h-3.5 w-28" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-7 w-24 rounded" />
          <Skeleton className="h-7 w-28 rounded-md" />
        </div>
      </header>

      {/* Artifact list */}
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-lg border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5",
                  i !== 7 && "border-b"
                )}
              >
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="h-3.5 flex-1" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ArtifactEditorSkeleton() {
  return (
    <div className="flex h-svh min-w-0 flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="flex h-11 shrink-0 items-center border-b px-2 gap-2">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-4 w-32" />
        <div className="flex-1" />
        <Skeleton className="h-6 w-6 rounded" />
      </header>

      {/* Body: editor + right panel */}
      <div className="flex min-h-0 flex-1">
        {/* Editor area */}
        <div className="flex min-h-0 flex-1 flex-col px-16 py-10 gap-4">
          <Skeleton className="h-8 w-56" />
          <div className="flex flex-col gap-3 mt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Right panel */}
        <div className="hidden w-96 shrink-0 flex-col border-l px-4 py-6 gap-4 lg:flex">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex flex-col gap-2 mt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function WorkspaceShellSkeleton() {
  return (
    <div className="flex h-svh w-full overflow-hidden">
      {/* Sidebar */}
      <div className="hidden h-full w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2 rounded-md p-2">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 px-4 py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex h-8 items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-1.5 px-4 py-2">
          <Skeleton className="h-3 w-16" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex h-8 items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          ))}
        </div>
        <div className="mt-auto p-2">
          <div className="flex items-center gap-2 rounded-md p-2">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <ArtifactListPageSkeleton />
    </div>
  )
}
