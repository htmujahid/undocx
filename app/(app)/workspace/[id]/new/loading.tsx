import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
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
        <div className="flex w-96 shrink-0 flex-col border-l px-4 py-6 gap-4">
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
