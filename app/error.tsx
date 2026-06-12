"use client"

import { useEffect } from "react"

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Empty className="max-w-md border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlertIcon />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            An unexpected error occurred. Try again, or head back home if the
            problem persists.
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
            href="/"
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            Go home
          </Link>
        </div>
      </Empty>
    </div>
  )
}
