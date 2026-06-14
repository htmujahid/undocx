import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function ArtifactListPageSkeleton() {
  return (
    <div className="flex h-svh min-w-0 flex-1 flex-col overflow-hidden">
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
      <header className="flex h-11 shrink-0 items-center gap-1 border-b px-2">
        <Skeleton className="size-7 rounded" />
        <Skeleton className="ml-1 h-3.5 w-36" />
        <div className="flex-1" />
        <Skeleton className="size-7 rounded" />
        <Skeleton className="size-7 rounded" />
        <Skeleton className="size-7 rounded" />
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-[720px] px-4 py-6 sm:px-8 sm:py-8">
            <div className="mb-6">
              <Skeleton className="mb-3 h-2.5 w-28" />
              <Skeleton className="h-8 w-64" />
              <div className="mt-2 flex items-center gap-3">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            </div>

            <div className="mb-6 h-px bg-border" />

            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="mt-6 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="mt-6 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </div>
        </div>

        <div className="hidden w-96 shrink-0 flex-col border-l lg:flex">
          <div className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
            <Skeleton className="h-3.5 w-20" />
            <div className="flex-1" />
            <Skeleton className="size-7 rounded" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="mt-auto">
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WorkspaceShellSkeleton() {
  return (
    <div className="flex h-svh w-full overflow-hidden">
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

      <ArtifactListPageSkeleton />
    </div>
  )
}
