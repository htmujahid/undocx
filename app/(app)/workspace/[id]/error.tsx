"use client"

import { useEffect } from "react"

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const params = useParams<{ id: string }>()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-svh min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
        <SidebarTrigger />
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <Empty className="max-w-md border-none">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TriangleAlertIcon />
            </EmptyMedia>
            <EmptyTitle>Something went wrong</EmptyTitle>
            <EmptyDescription>
              We couldn&apos;t load this view. Try again, or go back to your
              workspace.
            </EmptyDescription>
            {error.digest && (
              <p className="text-xs text-muted-foreground/70 tabular-nums">
                Error ID: {error.digest}
              </p>
            )}
          </EmptyHeader>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => unstable_retry()}>
              <RotateCcwIcon className="size-3.5" />
              Try again
            </Button>
            <Link
              href={`/workspace/${params.id}`}
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Back to workspace
            </Link>
          </div>
        </Empty>
      </div>
    </div>
  )
}
