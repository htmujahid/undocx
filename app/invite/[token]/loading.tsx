import Link from "next/link"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-11 shrink-0 items-center border-b px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Renderical
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col items-center rounded-xl border bg-card p-8 shadow-sm">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-4 h-4 w-64" />
          <Skeleton className="mt-2 h-6 w-40" />
          <Skeleton className="mt-2 h-3 w-20" />
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>
      </main>
    </div>
  )
}
